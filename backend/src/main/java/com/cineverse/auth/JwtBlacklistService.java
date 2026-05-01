package com.cineverse.auth;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtBlacklistService {

    private static final String PREFIX = "jwt:blacklist:";

    private final StringRedisTemplate redis;

    public JwtBlacklistService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void blacklist(String jti, Date expiresAt) {
        Instant now = Instant.now();
        Instant exp = expiresAt.toInstant();
        long seconds = Math.max(1, exp.getEpochSecond() - now.getEpochSecond());
        redis.opsForValue().set(PREFIX + jti, "1", Duration.ofSeconds(seconds));
    }

    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(PREFIX + jti));
    }
}
