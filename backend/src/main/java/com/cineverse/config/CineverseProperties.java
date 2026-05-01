package com.cineverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "cineverse")
public class CineverseProperties {

    private List<String> corsAllowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));
    private long cacheTtlSeconds = 120;
    private long seatLockTtlSeconds = 600;

    public List<String> getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }

    public void setCorsAllowedOrigins(List<String> corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
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
