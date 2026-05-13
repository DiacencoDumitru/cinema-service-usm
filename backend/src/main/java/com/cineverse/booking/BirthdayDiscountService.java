package com.cineverse.booking;

import com.cineverse.config.CineverseProperties;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Service
public class BirthdayDiscountService {

    private final CineverseProperties.BirthdayDiscount config;

    public BirthdayDiscountService(CineverseProperties properties) {
        this.config = properties.getBirthdayDiscount();
    }

    public boolean isEligible(LocalDate birthDate, Instant screeningStartsAt) {
        if (birthDate == null || screeningStartsAt == null) {
            return false;
        }
        LocalDate screeningDate = LocalDate.ofInstant(screeningStartsAt, ZoneId.of(config.getTimezone()));
        int year = screeningDate.getYear();
        long minDays = Long.MAX_VALUE;
        for (int delta = -1; delta <= 1; delta++) {
            LocalDate anniversary = birthdayInYear(birthDate, year + delta);
            long diff = Math.abs(ChronoUnit.DAYS.between(anniversary, screeningDate));
            if (diff < minDays) {
                minDays = diff;
            }
        }
        return minDays <= config.getWindowDays();
    }

    public BigDecimal apply(BigDecimal price) {
        BigDecimal multiplier = BigDecimal.valueOf(100L - config.getPercent());
        return price.multiply(multiplier).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public int getPercent() {
        return config.getPercent();
    }

    private LocalDate birthdayInYear(LocalDate birthDate, int year) {
        int month = birthDate.getMonthValue();
        int day = birthDate.getDayOfMonth();
        if (month == 2 && day == 29 && !Year.isLeap(year)) {
            return LocalDate.of(year, 3, 1);
        }
        return LocalDate.of(year, month, day);
    }
}
