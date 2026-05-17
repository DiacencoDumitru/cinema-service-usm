package com.cineverse.screening;

import com.cineverse.booking.BookingRepository;
import com.cineverse.booking.BookingSeatRepository;
import com.cineverse.booking.BookingStatus;
import com.cineverse.booking.SeatLockService;
import com.cineverse.cache.RedisCacheEvictionService;
import com.cineverse.common.ApiException;
import com.cineverse.common.pagination.CursorCodec;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.config.CineverseProperties;
import com.cineverse.hall.HallRepository;
import com.cineverse.hall.Seat;
import com.cineverse.hall.SeatRepository;
import com.cineverse.movie.Movie;
import com.cineverse.movie.MovieRepository;
import com.cineverse.screening.dto.ScreeningCreateRequest;
import com.cineverse.screening.dto.ScreeningScheduleRowResponse;
import com.cineverse.screening.dto.ScreeningSeatResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ScreeningService {

    private final ScreeningRepository screeningRepository;
    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatLockService seatLockService;
    private final RedisCacheEvictionService cacheEvictionService;
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final CineverseProperties cineverseProperties;

    public ScreeningService(ScreeningRepository screeningRepository,
                            MovieRepository movieRepository,
                            HallRepository hallRepository,
                            SeatRepository seatRepository,
                            BookingRepository bookingRepository,
                            BookingSeatRepository bookingSeatRepository,
                            SeatLockService seatLockService,
                            RedisCacheEvictionService cacheEvictionService,
                            StringRedisTemplate redis,
                            ObjectMapper objectMapper,
                            CineverseProperties cineverseProperties) {
        this.screeningRepository = screeningRepository;
        this.movieRepository = movieRepository;
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatLockService = seatLockService;
        this.cacheEvictionService = cacheEvictionService;
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.cineverseProperties = cineverseProperties;
    }

    public CursorPage<ScreeningScheduleRowResponse> schedule(LocalDate date,
                                                             ScreeningLanguage language,
                                                             String genresCsv,
                                                             String cursor,
                                                             int limit) throws Exception {
        Instant dayStart = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        String cacheKey = "cache:schedule:" + date;
        boolean cacheable = (genresCsv == null || genresCsv.isBlank())
                && language == null
                && (cursor == null || cursor.isBlank());
        if (cacheable) {
            String cached = redis.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<>() {
                });
            }
        }

        List<Screening> all = screeningRepository.findForDay(dayStart, dayEnd);
        List<Screening> filtered = all.stream()
                .filter(s -> language == null || s.getLanguage() == language)
                .filter(s -> matchesGenres(s.getMovie(), genresCsv))
                .collect(Collectors.toList());

        CursorCodec.ScreeningCursorDecoded c = CursorCodec.decodeScreening(cursor);
        int startIdx = 0;
        if (c != null) {
            startIdx = filtered.size();
            for (int i = 0; i < filtered.size(); i++) {
                Screening s = filtered.get(i);
                if (s.getStartsAt().isAfter(c.ts())
                        || (s.getStartsAt().equals(c.ts()) && s.getId() > c.id())) {
                    startIdx = i;
                    break;
                }
            }
        }

        List<Screening> slice = filtered.subList(startIdx, filtered.size());
        boolean hasMore = slice.size() > limit;
        List<Screening> page = hasMore ? slice.subList(0, limit) : slice;
        String next = null;
        if (hasMore && !page.isEmpty()) {
            Screening last = page.get(page.size() - 1);
            next = CursorCodec.encodeScreening(last.getStartsAt(), last.getId());
        }

        CursorPage<ScreeningScheduleRowResponse> result = new CursorPage<>(
                page.stream().map(this::toScheduleRow).collect(Collectors.toList()),
                next,
                hasMore
        );

        if (cacheable) {
            redis.opsForValue().set(cacheKey, objectMapper.writeValueAsString(result),
                    Duration.ofSeconds(cineverseProperties.getCacheTtlSeconds()));
        }
        return result;
    }

    public ScreeningScheduleRowResponse getScreeningDetail(Long id) {
        Screening screening = screeningRepository.findByIdWithMovieAndHall(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Screening not found"));
        return toScheduleRow(screening);
    }

    public List<ScreeningSeatResponse> seatsForScreening(Long screeningId, Long currentUserId) {
        Screening screening = screeningRepository.findByIdWithMovieAndHall(screeningId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Screening not found"));
        List<Seat> seats = seatRepository.findByHallIdOrderByRowNumAscColNumAsc(screening.getHall().getId());
        List<ScreeningSeatResponse> out = new ArrayList<>();
        for (Seat seat : seats) {
            String status;
            if (bookingSeatRepository.existsBySeatIdAndBooking_Status(seat.getId(), BookingStatus.PAID)) {
                status = "BOOKED";
            } else {
                String owner = seatLockService.lockOwner(screeningId, seat.getId());
                if (owner != null) {
                    if (currentUserId != null && owner.equals(String.valueOf(currentUserId))) {
                        status = "HELD";
                    } else {
                        status = "LOCKED";
                    }
                } else {
                    status = "FREE";
                }
            }
            out.add(new ScreeningSeatResponse(
                    seat.getId(),
                    seat.getRowNum(),
                    seat.getColNum(),
                    seat.getSeatType().name(),
                    status
            ));
        }
        return out;
    }

    @Transactional
    public ScreeningScheduleRowResponse create(ScreeningCreateRequest request) {
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Movie not found"));
        var hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Hall not found"));
        if (screeningRepository.existsByHall_IdAndStartsAt(hall.getId(), request.startsAt())) {
            throw new ApiException(HttpStatus.CONFLICT, "Hall already has screening at this time");
        }
        Screening screening = new Screening();
        screening.setMovie(movie);
        screening.setHall(hall);
        screening.setStartsAt(request.startsAt());
        screening.setFormat(request.format());
        screening.setLanguage(request.language());
        screening.setBasePrice(request.basePrice());
        screeningRepository.save(screening);
        cacheEvictionService.evictMovieAndScheduleCaches();
        Screening loaded = screeningRepository.findByIdWithMovieAndHall(screening.getId()).orElseThrow();
        return toScheduleRow(loaded);
    }

    @Transactional
    public ScreeningScheduleRowResponse update(Long id, ScreeningCreateRequest request) {
        Screening screening = screeningRepository.findByIdWithMovieAndHall(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Screening not found"));
        if (screeningRepository.existsByHall_IdAndStartsAtAndIdNot(request.hallId(), request.startsAt(), id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Hall already has screening at this time");
        }
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Movie not found"));
        var hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Hall not found"));
        screening.setMovie(movie);
        screening.setHall(hall);
        screening.setStartsAt(request.startsAt());
        screening.setFormat(request.format());
        screening.setLanguage(request.language());
        screening.setBasePrice(request.basePrice());
        screeningRepository.save(screening);
        cacheEvictionService.evictMovieAndScheduleCaches();
        Screening loaded = screeningRepository.findByIdWithMovieAndHall(id).orElseThrow();
        return toScheduleRow(loaded);
    }

    @Transactional
    public void delete(Long id) {
        if (!screeningRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Screening not found");
        }
        if (bookingRepository.existsByScreening_Id(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Screening has bookings");
        }
        screeningRepository.deleteById(id);
        cacheEvictionService.evictMovieAndScheduleCaches();
    }

    public List<ScreeningScheduleRowResponse> listScreeningsForMovie(Long movieId) {
        movieRepository.findById(movieId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Movie not found"));
        return screeningRepository.findScreeningsForMovie(movieId).stream()
                .map(this::toScheduleRow)
                .collect(Collectors.toList());
    }

    private boolean matchesGenres(Movie movie, String genresCsv) {
        if (genresCsv == null || genresCsv.isBlank()) {
            return true;
        }
        List<String> requested = new ArrayList<>();
        for (String part : genresCsv.split(",")) {
            String t = part.trim().toLowerCase(Locale.ROOT);
            if (!t.isEmpty()) {
                requested.add(t);
            }
        }
        if (requested.isEmpty()) {
            return true;
        }
        return movie.getGenres().stream().map(g -> g.toLowerCase(Locale.ROOT)).anyMatch(requested::contains);
    }

    private ScreeningScheduleRowResponse toScheduleRow(Screening s) {
        Movie m = s.getMovie();
        return new ScreeningScheduleRowResponse(
                s.getId(),
                m.getId(),
                m.getTitle(),
                m.getGenres(),
                m.getDurationMin(),
                m.getAgeRating(),
                m.getPosterUrl(),
                s.getStartsAt(),
                s.getHall().getId(),
                s.getHall().getName(),
                s.getFormat().name(),
                s.getLanguage().name(),
                s.getBasePrice()
        );
    }
}
