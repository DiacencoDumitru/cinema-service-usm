package com.cineverse.screening.dto;

public record ScreeningSeatResponse(
        Long seatId,
        int row,
        int col,
        String seatType,
        String status
) {
}
