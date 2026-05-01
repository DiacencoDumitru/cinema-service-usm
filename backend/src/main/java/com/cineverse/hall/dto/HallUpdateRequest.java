package com.cineverse.hall.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record HallUpdateRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull @Min(1) Integer rowsCount,
        @NotNull @Min(1) Integer seatsPerRow,
        List<Integer> vipRows
) {
}
