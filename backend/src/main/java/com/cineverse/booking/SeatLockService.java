package com.cineverse.booking;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SeatLockService {

    public static final String KEY_PREFIX = "seat:lock:";

    private final StringRedisTemplate redis;
    private final DefaultRedisScript<Long> seatLockAcquireScript;

    public SeatLockService(StringRedisTemplate redis, DefaultRedisScript<Long> seatLockAcquireScript) {
        this.redis = redis;
        this.seatLockAcquireScript = seatLockAcquireScript;
    }

    public boolean tryAcquireAll(Long screeningId, Long userId, List<Long> seatIds, long ttlSeconds) {
        if (seatIds.isEmpty()) {
            return false;
        }
        List<String> keys = seatIds.stream()
                .map(seatId -> lockKey(screeningId, seatId))
                .collect(Collectors.toList());
        Long result = redis.execute(seatLockAcquireScript, keys,
                String.valueOf(ttlSeconds),
                String.valueOf(userId));
        return Objects.equals(result, 1L);
    }

    public boolean locksHeldByUser(Long screeningId, Long userId, List<Long> seatIds) {
        for (Long seatId : seatIds) {
            String v = redis.opsForValue().get(lockKey(screeningId, seatId));
            if (v == null || !v.equals(String.valueOf(userId))) {
                return false;
            }
        }
        return true;
    }

    public void releaseLocks(Long screeningId, List<Long> seatIds) {
        for (Long seatId : seatIds) {
            redis.delete(lockKey(screeningId, seatId));
        }
    }

    public String lockOwner(Long screeningId, Long seatId) {
        return redis.opsForValue().get(lockKey(screeningId, seatId));
    }

    public static String lockKey(Long screeningId, Long seatId) {
        return KEY_PREFIX + screeningId + ":" + seatId;
    }
}
