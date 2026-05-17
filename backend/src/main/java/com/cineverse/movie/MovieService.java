package com.cineverse.movie;

import com.cineverse.cache.RedisCacheEvictionService;
import com.cineverse.common.ApiException;
import com.cineverse.common.pagination.CursorCodec;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.config.CineverseProperties;
import com.cineverse.movie.dto.MovieRequest;
import com.cineverse.movie.dto.MovieResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private static final String CACHE_FIRST_PAGE = "cache:movies:list:v1:first";

    private final MovieRepository movieRepository;
    private final RedisCacheEvictionService cacheEvictionService;
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final CineverseProperties cineverseProperties;

    public MovieService(MovieRepository movieRepository,
                        RedisCacheEvictionService cacheEvictionService,
                        StringRedisTemplate redis,
                        ObjectMapper objectMapper,
                        CineverseProperties cineverseProperties) {
        this.movieRepository = movieRepository;
        this.cacheEvictionService = cacheEvictionService;
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.cineverseProperties = cineverseProperties;
    }

    public CursorPage<MovieResponse> list(MovieStatus status, String genresCsv, String cursor, int limit) throws Exception {
        boolean cacheable = (genresCsv == null || genresCsv.isBlank())
                && status == null
                && (cursor == null || cursor.isBlank());
        if (cacheable) {
            String cached = redis.opsForValue().get(CACHE_FIRST_PAGE);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<>() {
                });
            }
        }

        Long cursorId = CursorCodec.decodeId(cursor);
        String statusStr = status == null ? null : status.name();
        String genreArg = genresCsv == null ? "" : genresCsv;
        List<Movie> rows = movieRepository.findPageNative(statusStr, genreArg, cursorId, limit + 1);
        boolean hasMore = rows.size() > limit;
        List<Movie> page = hasMore ? rows.subList(0, limit) : rows;
        String next = null;
        if (hasMore && !page.isEmpty()) {
            next = CursorCodec.encodeId(page.get(page.size() - 1).getId());
        }
        CursorPage<MovieResponse> result = new CursorPage<>(
                page.stream().map(this::toDto).collect(Collectors.toList()),
                next,
                hasMore
        );
        if (cacheable) {
            redis.opsForValue().set(CACHE_FIRST_PAGE, objectMapper.writeValueAsString(result),
                    Duration.ofSeconds(cineverseProperties.getCacheTtlSeconds()));
        }
        return result;
    }

    public MovieResponse getById(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Movie not found"));
        return toDto(movie);
    }

    @Transactional
    public MovieResponse create(MovieRequest request) {
        Movie movie = fromRequest(new Movie(), request);
        movieRepository.save(movie);
        cacheEvictionService.evictMovieAndScheduleCaches();
        return toDto(movie);
    }

    @Transactional
    public MovieResponse update(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Movie not found"));
        fromRequest(movie, request);
        movieRepository.save(movie);
        cacheEvictionService.evictMovieAndScheduleCaches();
        return toDto(movie);
    }

    @Transactional
    public void delete(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Movie not found");
        }
        movieRepository.deleteById(id);
        cacheEvictionService.evictMovieAndScheduleCaches();
    }

    private Movie fromRequest(Movie movie, MovieRequest request) {
        movie.setTitle(request.title());
        movie.setOriginalTitle(request.originalTitle());
        movie.setTitleRu(request.titleRu());
        movie.setDurationMin(request.durationMin());
        movie.setFormats(nullToEmpty(request.formats()));
        movie.setLanguages(nullToEmpty(request.languages()));
        movie.setGenres(request.genres());
        movie.setDirector(request.director());
        movie.setActors(request.actors());
        movie.setAgeRating(request.ageRating());
        movie.setSynopsis(request.synopsis());
        movie.setPosterUrl(request.posterUrl());
        movie.setTrailerUrl(normalizeYouTubeTrailerUrl(request.trailerUrl()));
        movie.setStatus(request.status());
        movie.setReleaseDate(request.releaseDate());
        return movie;
    }

    private static List<String> nullToEmpty(List<String> list) {
        return list == null ? Collections.emptyList() : list;
    }

    private MovieResponse toDto(Movie m) {
        return new MovieResponse(
                m.getId(),
                m.getTitle(),
                m.getOriginalTitle(),
                m.getTitleRu(),
                m.getDurationMin(),
                nullToEmpty(m.getFormats()),
                nullToEmpty(m.getLanguages()),
                m.getGenres(),
                m.getDirector(),
                m.getActors(),
                m.getAgeRating(),
                m.getSynopsis(),
                m.getPosterUrl(),
                normalizeYouTubeTrailerUrl(m.getTrailerUrl()),
                m.getStatus(),
                m.getReleaseDate()
        );
    }

    private String normalizeYouTubeTrailerUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return rawUrl;
        }
        try {
            URI uri = URI.create(rawUrl.trim());
            String host = uri.getHost();
            if (host == null) {
                return rawUrl;
            }
            String normalizedHost = host.toLowerCase();
            String path = uri.getPath() == null ? "" : uri.getPath();

            if (normalizedHost.contains("youtube.com") && path.startsWith("/embed/")) {
                return rawUrl;
            }

            if (normalizedHost.contains("youtube.com") && "/watch".equals(path) && uri.getQuery() != null) {
                for (String part : uri.getQuery().split("&")) {
                    int idx = part.indexOf('=');
                    if (idx > 0 && "v".equals(part.substring(0, idx))) {
                        String id = part.substring(idx + 1);
                        if (!id.isBlank()) {
                            return "https://www.youtube.com/embed/" + id;
                        }
                    }
                }
            }

            if (normalizedHost.contains("youtu.be")) {
                String id = path.startsWith("/") ? path.substring(1) : path;
                if (!id.isBlank()) {
                    int slash = id.indexOf('/');
                    if (slash >= 0) {
                        id = id.substring(0, slash);
                    }
                    return "https://www.youtube.com/embed/" + id;
                }
            }
        } catch (IllegalArgumentException ignored) {
            return rawUrl;
        }
        return rawUrl;
    }
}
