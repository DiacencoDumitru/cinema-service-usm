package com.cineverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "cineverse")
public class CineverseProperties {

    private List<String> corsAllowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));
    private long cacheTtlSeconds = 120;
    private long seatLockTtlSeconds = 600;

    public List<String> getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }

    public void setCorsAllowedOrigins(List<String> corsAllowedOrigins) {
        if (corsAllowedOrigins == null) {
            this.corsAllowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));
            return;
        }
        List<String> cleaned = corsAllowedOrigins.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
        this.corsAllowedOrigins = cleaned.isEmpty()
                ? new ArrayList<>(List.of("http://localhost:5173"))
                : cleaned;
    }

    public long getCacheTtlSeconds() {
        return cacheTtlSeconds;
    }

    public void setCacheTtlSeconds(long cacheTtlSeconds) {
        this.cacheTtlSeconds = cacheTtlSeconds;
    }

    public long getSeatLockTtlSeconds() {
        return seatLockTtlSeconds;
    }

    public void setSeatLockTtlSeconds(long seatLockTtlSeconds) {
        this.seatLockTtlSeconds = seatLockTtlSeconds;
    }
}
