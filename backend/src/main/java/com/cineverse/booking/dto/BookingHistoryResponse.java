package com.cineverse.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingHistoryResponse(
        Long bookingId,
        String movieTitle,
        String originalTitle,
        String titleRu,
        Instant screeningStartsAt,
        String hallName,
        BigDecimal totalPrice,
        String status,
        List<BookingSeatLineResponse> seats
) {
}
