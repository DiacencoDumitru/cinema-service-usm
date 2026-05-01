package com.cineverse.movie.dto;

import com.cineverse.movie.MovieStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record MovieRequest(
        @NotBlank @Size(max = 500) String title,
        @Size(max = 500) String originalTitle,
        @NotNull @Positive int durationMin,
        List<@NotBlank @Size(max = 16) String> formats,
        List<@NotBlank @Size(max = 32) String> languages,
        @NotNull List<@NotBlank @Size(max = 64) String> genres,
        @Size(max = 500) String director,
        @NotNull List<@NotBlank @Size(max = 255) String> actors,
        @Size(max = 32) String ageRating,
        String synopsis,
        @Size(max = 2048) String posterUrl,
        @Size(max = 2048) String trailerUrl,
        @NotNull MovieStatus status,
        LocalDate releaseDate
) {
}
