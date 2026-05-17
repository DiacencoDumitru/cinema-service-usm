package com.cineverse.booking;

import com.cineverse.common.ApiException;
import com.cineverse.common.pagination.CursorCodec;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.config.CineverseProperties;
import com.cineverse.hall.Seat;
import com.cineverse.hall.SeatRepository;
import com.cineverse.hall.SeatType;
import com.cineverse.booking.dto.AdminBookingRowResponse;
import com.cineverse.booking.dto.BookingDetailResponse;
import com.cineverse.booking.dto.BookingHistoryResponse;
import com.cineverse.booking.dto.BookingPaidResponse;
import com.cineverse.booking.dto.BookingSeatItemRequest;
import com.cineverse.booking.dto.BookingSeatLineResponse;
import com.cineverse.booking.dto.BookingSeatSelectionRequest;
import com.cineverse.booking.dto.SeatLockResponse;
import com.cineverse.promo.PromoCodeService;
import com.cineverse.price.PriceCategory;
import com.cineverse.price.PriceRuleRepository;
import com.cineverse.screening.Screening;
import com.cineverse.screening.ScreeningRepository;
import com.cineverse.user.User;
import com.cineverse.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ScreeningRepository screeningRepository;
    private final SeatRepository seatRepository;
    private final SeatLockService seatLockService;
    private final PriceRuleRepository priceRuleRepository;
    private final UserRepository userRepository;
    private final CineverseProperties cineverseProperties;
    private final BirthdayDiscountService birthdayDiscountService;
    private final PromoCodeService promoCodeService;

    public BookingService(BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          ScreeningRepository screeningRepository,
                          SeatRepository seatRepository,
                          SeatLockService seatLockService,
                          PriceRuleRepository priceRuleRepository,
                          UserRepository userRepository,
                          CineverseProperties cineverseProperties,
                          BirthdayDiscountService birthdayDiscountService,
                          PromoCodeService promoCodeService) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.screeningRepository = screeningRepository;
        this.seatRepository = seatRepository;
        this.seatLockService = seatLockService;
        this.priceRuleRepository = priceRuleRepository;
        this.userRepository = userRepository;
        this.cineverseProperties = cineverseProperties;
        this.birthdayDiscountService = birthdayDiscountService;
        this.promoCodeService = promoCodeService;
    }

    public SeatLockResponse lockSeats(Long userId, BookingSeatSelectionRequest request) {
        Screening screening = screeningRepository.findByIdWithMovieAndHall(request.screeningId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Screening not found"));
        List<Long> seatIds = extractSeatIds(request);
        validateSeatSelection(screening, seatIds);
        validatePriceCategories(request);
        long ttl = cineverseProperties.getSeatLockTtlSeconds();
        if (seatLockService.locksHeldByUser(request.screeningId(), userId, seatIds)) {
            return new SeatLockResponse(Instant.now().plusSeconds(ttl), ttl);
        }
        if (!seatLockService.tryAcquireAll(request.screeningId(), userId, seatIds, ttl)) {
            throw new ApiException(HttpStatus.CONFLICT, "One or more seats are not available");
        }
        return new SeatLockResponse(Instant.now().plusSeconds(ttl), ttl);
    }

    @Transactional
    public BookingPaidResponse createPendingBooking(Long userId, BookingSeatSelectionRequest request) {
        Screening screening = screeningRepository.findByIdWithMovieAndHall(request.screeningId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Screening not found"));
        validatePriceCategories(request);
        Map<Long, PriceCategory> categoriesBySeat = categoriesBySeatId(request);
        List<Long> seatIds = extractSeatIds(request);
        List<Seat> seats = validateSeatSelection(screening, seatIds);

        if (!seatLockService.locksHeldByUser(request.screeningId(), userId, seatIds)) {
            long ttl = cineverseProperties.getSeatLockTtlSeconds();
            if (!seatLockService.tryAcquireAll(request.screeningId(), userId, seatIds, ttl)) {
                throw new ApiException(HttpStatus.CONFLICT, "One or more seats are not available");
            }
        }

        for (Long seatId : seatIds) {
            if (bookingSeatRepository.existsBySeatId(seatId)) {
                seatLockService.releaseLocks(request.screeningId(), seatIds);
                throw new ApiException(HttpStatus.CONFLICT, "Seat already booked");
            }
        }

        return savePendingBooking(userId, screening, seats, categoriesBySeat, request);
    }

    @Transactional
    public BookingPaidResponse confirmPayment(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking is not awaiting payment");
        }
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);
        if (booking.getPromoCode() != null) {
            promoCodeService.consume(booking.getPromoCode());
        }
        return toPaidResponse(booking);
    }

    private BookingPaidResponse savePendingBooking(Long userId,
                                                   Screening screening,
                                                   List<Seat> seats,
                                                   Map<Long, PriceCategory> categoriesBySeat,
                                                   BookingSeatSelectionRequest request) {
        Long screeningId = request.screeningId();
        List<Long> seatIds = extractSeatIds(request);
        User user = userRepository.findById(userId).orElseThrow();
        boolean discountEligible = birthdayDiscountService.isEligible(user.getBirthDate(), screening.getStartsAt());
        int discountPercent = discountEligible ? birthdayDiscountService.getPercent() : 0;

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        List<BookingSeatLineResponse> lines = new ArrayList<>();
        for (Seat seat : seats) {
            PriceCategory ticketCategory = categoriesBySeat.get(seat.getId());
            BigDecimal base = resolvePrice(screening, seat, ticketCategory);
            BigDecimal applied = discountEligible ? birthdayDiscountService.apply(base) : base;
            subtotal = subtotal.add(base);
            total = total.add(applied);
            lines.add(new BookingSeatLineResponse(seat.getRowNum(), seat.getColNum(), seat.getSeatType().name(), applied));
        }
        int promoPercent = promoCodeService.resolveDiscountPercent(request.promoCode());
        BigDecimal promoAmount = BigDecimal.ZERO;
        if (promoPercent > 0) {
            promoAmount = total.multiply(BigDecimal.valueOf(promoPercent))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            total = total.subtract(promoAmount);
        }
        BigDecimal discountAmount = subtotal.subtract(total);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setScreening(screening);
        booking.setTotalPrice(total);
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookingCode(generateUniqueBookingCode());
        if (request.promoCode() != null && !request.promoCode().isBlank()) {
            booking.setPromoCode(request.promoCode().trim().toUpperCase());
        }
        bookingRepository.saveAndFlush(booking);

        for (int i = 0; i < seats.size(); i++) {
            Seat seat = seats.get(i);
            BookingSeat bs = new BookingSeat();
            bs.setBooking(booking);
            bs.setSeat(seat);
            bs.setPrice(lines.get(i).price());
            bs.setId(new BookingSeatId(booking.getId(), seat.getId()));
            bookingSeatRepository.save(bs);
        }

        seatLockService.releaseLocks(screeningId, seatIds);
        return toPaidResponse(booking, screening, subtotal, discountPercent, discountAmount, total, lines);
    }

    private BookingPaidResponse toPaidResponse(Booking booking) {
        Screening screening = booking.getScreening();
        BigDecimal total = booking.getTotalPrice();
        List<BookingSeatLineResponse> lines = booking.getSeats().stream()
                .map(bs -> new BookingSeatLineResponse(
                        bs.getSeat().getRowNum(),
                        bs.getSeat().getColNum(),
                        bs.getSeat().getSeatType().name(),
                        bs.getPrice()))
                .collect(Collectors.toList());
        BigDecimal linesTotal = lines.stream()
                .map(BookingSeatLineResponse::price)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        User user = booking.getUser();
        boolean discountEligible = birthdayDiscountService.isEligible(user.getBirthDate(), screening.getStartsAt());
        int discountPercent = discountEligible ? birthdayDiscountService.getPercent() : 0;
        BigDecimal subtotal = linesTotal;
        if (discountEligible && discountPercent > 0) {
            subtotal = linesTotal.multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(100 - discountPercent), 2, RoundingMode.HALF_UP);
        }
        BigDecimal discountAmount = subtotal.subtract(total).max(BigDecimal.ZERO);
        return toPaidResponse(booking, screening, subtotal, discountPercent, discountAmount, total, lines);
    }

    private BookingPaidResponse toPaidResponse(Booking booking,
                                             Screening screening,
                                             BigDecimal subtotal,
                                             int discountPercent,
                                             BigDecimal discountAmount,
                                             BigDecimal total,
                                             List<BookingSeatLineResponse> lines) {
        var movie = screening.getMovie();
        return new BookingPaidResponse(
                booking.getId(),
                booking.getBookingCode(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getTitleRu(),
                screening.getStartsAt(),
                screening.getHall().getName(),
                subtotal,
                discountPercent,
                discountAmount,
                total,
                lines
        );
    }

    @Transactional
    public void cancelBooking(Long userId, Long bookingId, boolean admin) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!admin && !booking.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your booking");
        }
        if (booking.getStatus() != BookingStatus.PAID && booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking cannot be cancelled");
        }
        if (booking.getStatus() == BookingStatus.PAID
                && booking.getScreening().getStartsAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Screening has already started");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        bookingSeatRepository.deleteByBooking_Id(bookingId);
    }

    public CursorPage<BookingHistoryResponse> listUserBookings(Long userId, String cursor, int limit) throws Exception {
        Long cursorId = CursorCodec.decodeId(cursor);
        List<Booking> rows = bookingRepository.findUserBookings(userId, cursorId, PageRequest.of(0, limit + 1));
        boolean hasMore = rows.size() > limit;
        List<Booking> page = hasMore ? rows.subList(0, limit) : rows;
        String next = null;
        if (hasMore && !page.isEmpty()) {
            next = CursorCodec.encodeId(page.get(page.size() - 1).getId());
        }
        List<BookingHistoryResponse> items = page.stream().map(this::toHistory).collect(Collectors.toList());
        return new CursorPage<>(items, next, hasMore);
    }

    public BookingDetailResponse getUserBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findByIdForUser(bookingId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (booking.getStatus() != BookingStatus.PAID) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ticket is available only for paid bookings");
        }
        Screening s = booking.getScreening();
        var movie = s.getMovie();
        List<BookingSeatLineResponse> seatLines = booking.getSeats().stream()
                .map(bs -> new BookingSeatLineResponse(
                        bs.getSeat().getRowNum(),
                        bs.getSeat().getColNum(),
                        bs.getSeat().getSeatType().name(),
                        bs.getPrice()))
                .collect(Collectors.toList());
        return new BookingDetailResponse(
                booking.getId(),
                booking.getBookingCode(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getTitleRu(),
                s.getStartsAt(),
                s.getHall().getName(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                seatLines
        );
    }

    public String exportAdminBookingsCsv(Long movieId, LocalDate date) throws Exception {
        CursorPage<AdminBookingRowResponse> page = listAdminBookings(movieId, date, null, 10_000);
        StringBuilder sb = new StringBuilder("bookingId,userEmail,movie,screeningAt,hall,total,status\n");
        for (AdminBookingRowResponse row : page.items()) {
            sb.append(row.bookingId()).append(',')
                    .append(csvEscape(row.userEmail())).append(',')
                    .append(csvEscape(row.movieTitle())).append(',')
                    .append(row.screeningStartsAt()).append(',')
                    .append(csvEscape(row.hallName())).append(',')
                    .append(row.totalPrice()).append(',')
                    .append(row.status()).append('\n');
        }
        return sb.toString();
    }

    public CursorPage<AdminBookingRowResponse> listAdminBookings(Long movieId, LocalDate date, String cursor, int limit)
            throws Exception {
        Long cursorId = CursorCodec.decodeId(cursor);
        Instant dayStart = date == null ? null : date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant dayEnd = date == null ? null : date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        List<Booking> rows = bookingRepository.findAdminPage(movieId, dayStart, dayEnd, cursorId,
                PageRequest.of(0, limit + 1));
        boolean hasMore = rows.size() > limit;
        List<Booking> page = hasMore ? rows.subList(0, limit) : rows;
        String next = null;
        if (hasMore && !page.isEmpty()) {
            next = CursorCodec.encodeId(page.get(page.size() - 1).getId());
        }
        List<AdminBookingRowResponse> items = page.stream().map(this::toAdminRow).collect(Collectors.toList());
        return new CursorPage<>(items, next, hasMore);
    }

    private AdminBookingRowResponse toAdminRow(Booking b) {
        Screening s = b.getScreening();
        var movie = s.getMovie();
        return new AdminBookingRowResponse(
                b.getId(),
                b.getUser().getEmail(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getTitleRu(),
                s.getStartsAt(),
                s.getHall().getName(),
                b.getTotalPrice(),
                b.getStatus().name()
        );
    }

    private BookingHistoryResponse toHistory(Booking b) {
        Screening s = b.getScreening();
        List<BookingSeatLineResponse> seatLines = b.getSeats().stream()
                .map(bs -> new BookingSeatLineResponse(
                        bs.getSeat().getRowNum(),
                        bs.getSeat().getColNum(),
                        bs.getSeat().getSeatType().name(),
                        bs.getPrice()
                ))
                .collect(Collectors.toList());
        var movie = s.getMovie();
        return new BookingHistoryResponse(
                b.getId(),
                b.getBookingCode(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getTitleRu(),
                s.getStartsAt(),
                s.getHall().getName(),
                b.getTotalPrice(),
                b.getStatus().name(),
                seatLines
        );
    }

    private List<Long> extractSeatIds(BookingSeatSelectionRequest request) {
        return request.seats().stream().map(BookingSeatItemRequest::seatId).toList();
    }

    private Map<Long, PriceCategory> categoriesBySeatId(BookingSeatSelectionRequest request) {
        Map<Long, PriceCategory> map = new HashMap<>();
        for (BookingSeatItemRequest item : request.seats()) {
            map.put(item.seatId(), item.priceCategory());
        }
        return map;
    }

    private void validatePriceCategories(BookingSeatSelectionRequest request) {
        for (BookingSeatItemRequest item : request.seats()) {
            PriceCategory cat = item.priceCategory();
            if (cat == PriceCategory.VIP) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid ticket category");
            }
        }
    }

    private List<Seat> validateSeatSelection(Screening screening, List<Long> seatIds) {
        if (seatIds.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Select at least one seat");
        }
        Set<Long> unique = new HashSet<>(seatIds);
        if (unique.size() != seatIds.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate seats");
        }
        List<Seat> seats = seatRepository.findByIdInWithHall(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid seat id");
        }
        Long hallId = screening.getHall().getId();
        for (Seat seat : seats) {
            if (!seat.getHall().getId().equals(hallId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Seat does not belong to screening hall");
            }
        }
        return seats;
    }

    private BigDecimal resolvePrice(Screening screening, Seat seat, PriceCategory ticketCategory) {
        PriceCategory category;
        if (ticketCategory == PriceCategory.CHILD || ticketCategory == PriceCategory.STUDENT) {
            category = ticketCategory;
        } else {
            category = seat.getSeatType() == SeatType.VIP ? PriceCategory.VIP : PriceCategory.STANDARD;
        }
        return priceRuleRepository.findByCategoryAndFormat(category, screening.getFormat())
                .map(rule -> rule.getAmount())
                .orElse(screening.getBasePrice());
    }

    private String generateUniqueBookingCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            String code = BookingCodeGenerator.generate();
            if (!bookingRepository.existsByBookingCode(code)) {
                return code;
            }
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate booking code");
    }

    private static String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
