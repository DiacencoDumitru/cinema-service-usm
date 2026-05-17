package com.cineverse.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BookingSeatSelectionRequest(
        @NotNull Long screeningId,
        @NotEmpty List<@Valid BookingSeatItemRequest> seats
) {
}
