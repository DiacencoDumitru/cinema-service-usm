package com.cineverse.booking.dto;

import com.cineverse.price.PriceCategory;
import jakarta.validation.constraints.NotNull;

public record BookingSeatItemRequest(
        @NotNull Long seatId,
        @NotNull PriceCategory priceCategory
) {
}
