package com.cineverse.promo;

import com.cineverse.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    public int resolveDiscountPercent(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return 0;
        }
        PromoCode promo = promoCodeRepository.findById(rawCode.trim().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid promo code"));
        validate(promo);
        return promo.getDiscountPercent();
    }

    @Transactional
    public void consume(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return;
        }
        PromoCode promo = promoCodeRepository.findById(rawCode.trim().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid promo code"));
        validate(promo);
        promo.setUsedCount(promo.getUsedCount() + 1);
        promoCodeRepository.save(promo);
    }

    private void validate(PromoCode promo) {
        if (!promo.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Promo code is not active");
        }
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Promo code expired");
        }
        if (promo.getMaxUses() != null && promo.getUsedCount() >= promo.getMaxUses()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Promo code usage limit reached");
        }
    }
}
