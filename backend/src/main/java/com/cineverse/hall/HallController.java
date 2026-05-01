package com.cineverse.hall;

import com.cineverse.common.pagination.CursorPage;
import com.cineverse.hall.dto.HallCreateRequest;
import com.cineverse.hall.dto.HallResponse;
import com.cineverse.hall.dto.HallUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/halls")
public class HallController {

    private final HallService hallService;

    public HallController(HallService hallService) {
        this.hallService = hallService;
    }

    @GetMapping
    public CursorPage<HallResponse> list(@RequestParam(required = false) String cursor,
                                         @RequestParam(defaultValue = "20") int limit) throws Exception {
        return hallService.list(cursor, limit);
    }

    @PostMapping
    public HallResponse create(@Valid @RequestBody HallCreateRequest request) {
        return hallService.create(request);
    }

    @PutMapping("/{id}")
    public HallResponse update(@PathVariable Long id, @Valid @RequestBody HallUpdateRequest request) {
        return hallService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        hallService.delete(id);
    }
}
