package com.cineverse.screening.dto;

import com.cineverse.screening.ScreeningFormat;
import com.cineverse.screening.ScreeningLanguage;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.Instant;

public record ScreeningCreateRequest(
        @NotNull Long movieId,
        @NotNull Long hallId,
        @NotNull Instant startsAt,
        @NotNull ScreeningFormat format,
        @NotNull ScreeningLanguage language,
        @NotNull @PositiveOrZero BigDecimal basePrice
) {
}
