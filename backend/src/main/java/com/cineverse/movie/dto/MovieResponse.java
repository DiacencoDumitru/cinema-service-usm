package com.cineverse.movie.dto;

import com.cineverse.movie.MovieStatus;

import java.time.LocalDate;
import java.util.List;

public record MovieResponse(
        Long id,
        String title,
        String originalTitle,
        String titleRu,
        int durationMin,
        List<String> formats,
        List<String> languages,
        List<String> genres,
        String director,
        List<String> actors,
        String ageRating,
        String synopsis,
        String posterUrl,
        String trailerUrl,
        MovieStatus status,
        LocalDate releaseDate
) {
}
