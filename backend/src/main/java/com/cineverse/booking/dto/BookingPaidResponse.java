package com.cineverse.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingPaidResponse(
        Long bookingId,
        String movieTitle,
        String originalTitle,
        String titleRu,
        Instant screeningStartsAt,
        String hallName,
        BigDecimal subtotal,
        int discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalPrice,
        List<BookingSeatLineResponse> seats
) {
}
