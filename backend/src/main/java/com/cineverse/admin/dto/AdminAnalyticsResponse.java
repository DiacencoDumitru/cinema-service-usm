package com.cineverse.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminAnalyticsResponse(
        BigDecimal revenueLast7Days,
        long paidBookingsLast7Days,
        long cancellationsLast7Days,
        List<TopMovieRow> topMovies
) {
    public record TopMovieRow(Long movieId, String title, long bookingCount) {
    }
}
