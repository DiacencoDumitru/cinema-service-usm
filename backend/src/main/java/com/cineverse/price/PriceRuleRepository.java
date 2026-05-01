package com.cineverse.price;

import com.cineverse.screening.ScreeningFormat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriceRuleRepository extends JpaRepository<PriceRule, PriceRuleId> {

    Optional<PriceRule> findByCategoryAndFormat(PriceCategory category, ScreeningFormat format);
}
