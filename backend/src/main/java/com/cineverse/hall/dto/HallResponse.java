package com.cineverse.hall.dto;

import java.util.List;

public record HallResponse(Long id, String name, int rowsCount, int seatsPerRow, List<Integer> vipRows) {
}
