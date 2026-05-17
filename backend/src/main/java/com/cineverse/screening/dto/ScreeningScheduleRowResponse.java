package com.cineverse.screening.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ScreeningScheduleRowResponse(
        Long screeningId,
        Long movieId,
        String title,
        String originalTitle,
        String titleRu,
        List<String> genres,
        int durationMin,
        String ageRating,
        String posterUrl,
        Instant startsAt,
        Long hallId,
        String hallName,
        String format,
        String language,
        BigDecimal basePrice
) {
}
