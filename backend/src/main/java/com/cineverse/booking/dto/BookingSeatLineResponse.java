package com.cineverse.booking.dto;

import java.math.BigDecimal;

public record BookingSeatLineResponse(int row, int col, String seatType, BigDecimal price) {
}
