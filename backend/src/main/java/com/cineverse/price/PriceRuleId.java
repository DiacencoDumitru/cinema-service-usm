package com.cineverse.price;

import com.cineverse.screening.ScreeningFormat;

import java.io.Serializable;
import java.util.Objects;

public class PriceRuleId implements Serializable {

    private PriceCategory category;
    private ScreeningFormat format;

    public PriceRuleId() {
    }

    public PriceRuleId(PriceCategory category, ScreeningFormat format) {
        this.category = category;
        this.format = format;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        PriceRuleId that = (PriceRuleId) o;
        return category == that.category && format == that.format;
    }

    @Override
    public int hashCode() {
        return Objects.hash(category, format);
    }
}
