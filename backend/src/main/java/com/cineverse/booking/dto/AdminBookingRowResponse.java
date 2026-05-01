package com.cineverse.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminBookingRowResponse(
        Long bookingId,
        String userEmail,
        String movieTitle,
        Instant screeningStartsAt,
        String hallName,
        BigDecimal totalPrice
) {
}
