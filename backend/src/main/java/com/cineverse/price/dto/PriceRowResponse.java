package com.cineverse.price.dto;

import java.math.BigDecimal;

public record PriceRowResponse(String category, String format, BigDecimal amount) {
}
