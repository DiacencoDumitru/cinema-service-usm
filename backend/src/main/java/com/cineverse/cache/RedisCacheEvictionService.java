package com.cineverse.cache;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class RedisCacheEvictionService {

    private final StringRedisTemplate redis;

    public RedisCacheEvictionService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void evictByPattern(String pattern) {
        Set<String> keys = redis.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
        }
    }

    public void evictMovieAndScheduleCaches() {
        evictByPattern("cache:movies:*");
        evictByPattern("cache:schedule:*");
    }
}
