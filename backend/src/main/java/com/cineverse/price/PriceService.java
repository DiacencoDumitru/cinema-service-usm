package com.cineverse.price;

import com.cineverse.common.pagination.CursorPage;
import com.cineverse.price.dto.PriceRowResponse;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PriceService {

    private final PriceRuleRepository priceRuleRepository;

    public PriceService(PriceRuleRepository priceRuleRepository) {
        this.priceRuleRepository = priceRuleRepository;
    }

    public CursorPage<PriceRowResponse> listAll() {
        List<PriceRowResponse> rows = priceRuleRepository.findAll(Sort.by("category").ascending().and(Sort.by("format")))
                .stream()
                .map(p -> new PriceRowResponse(p.getCategory().name(), p.getFormat().name(), p.getAmount()))
                .collect(Collectors.toList());
        return new CursorPage<>(rows, null, false);
    }
}
