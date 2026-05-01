package com.cineverse.price;

import com.cineverse.screening.ScreeningFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "prices")
@IdClass(PriceRuleId.class)
public class PriceRule {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PriceCategory category;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ScreeningFormat format;

    @Column(nullable = false)
    private BigDecimal amount;

    public PriceRule() {
    }

    public PriceCategory getCategory() {
        return category;
    }

    public void setCategory(PriceCategory category) {
        this.category = category;
    }

    public ScreeningFormat getFormat() {
        return format;
    }

    public void setFormat(ScreeningFormat format) {
        this.format = format;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
