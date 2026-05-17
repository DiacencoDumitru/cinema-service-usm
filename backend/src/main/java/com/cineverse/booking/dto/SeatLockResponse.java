package com.cineverse.booking.dto;

import java.time.Instant;

public record SeatLockResponse(Instant expiresAt, long ttlSeconds) {
}
