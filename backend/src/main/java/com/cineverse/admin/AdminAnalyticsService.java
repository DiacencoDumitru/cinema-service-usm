package com.cineverse.admin;

import com.cineverse.admin.dto.AdminAnalyticsResponse;
import com.cineverse.booking.BookingRepository;
import com.cineverse.booking.BookingStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class AdminAnalyticsService {

    private final BookingRepository bookingRepository;

    public AdminAnalyticsService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public AdminAnalyticsResponse summary() {
        Instant since = Instant.now().minusSeconds(7 * 24 * 3600L);
        BigDecimal revenue = bookingRepository.sumPaidRevenueSince(BookingStatus.PAID, since);
        long paid = bookingRepository.countByStatusSince(BookingStatus.PAID, since);
        long cancelled = bookingRepository.countByStatusSince(BookingStatus.CANCELLED, since);
        List<AdminAnalyticsResponse.TopMovieRow> top = bookingRepository.topMoviesSince(since, 5).stream()
                .map(row -> new AdminAnalyticsResponse.TopMovieRow(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue()))
                .toList();
        return new AdminAnalyticsResponse(revenue, paid, cancelled, top);
    }
}
