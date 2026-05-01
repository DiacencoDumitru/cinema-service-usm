package com.cineverse.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingHistoryResponse(
        Long bookingId,
        String movieTitle,
        Instant screeningStartsAt,
        String hallName,
        BigDecimal totalPrice,
        List<BookingSeatLineResponse> seats
) {
}
