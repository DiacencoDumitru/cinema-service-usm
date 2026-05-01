package com.cineverse.price;

import com.cineverse.common.pagination.CursorPage;
import com.cineverse.price.dto.PriceRowResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    @GetMapping
    public CursorPage<PriceRowResponse> list() {
        return priceService.listAll();
    }
}
