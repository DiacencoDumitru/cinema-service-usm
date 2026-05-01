package com.cineverse.screening;

import com.cineverse.auth.UserPrincipal;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.screening.dto.ScreeningCreateRequest;
import com.cineverse.screening.dto.ScreeningScheduleRowResponse;
import com.cineverse.screening.dto.ScreeningSeatResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class ScreeningController {

    private final ScreeningService screeningService;

    public ScreeningController(ScreeningService screeningService) {
        this.screeningService = screeningService;
    }

    @GetMapping("/{id}")
    public ScreeningScheduleRowResponse screening(@PathVariable Long id) {
        return screeningService.getScreeningDetail(id);
    }

    @GetMapping(params = "date")
    public CursorPage<ScreeningScheduleRowResponse> listByDay(@RequestParam LocalDate date,
                                                            @RequestParam(required = false) ScreeningLanguage language,
                                                            @RequestParam(required = false) String genres,
                                                            @RequestParam(required = false) String cursor,
                                                            @RequestParam(defaultValue = "50") int limit) throws Exception {
        return screeningService.schedule(date, language, genres, cursor, limit);
    }

    @GetMapping("/{id}/seats")
    public List<ScreeningSeatResponse> seats(@PathVariable Long id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        return screeningService.seatsForScreening(id, userId);
    }

    @PostMapping
    public ScreeningScheduleRowResponse create(@Valid @RequestBody ScreeningCreateRequest request) {
        return screeningService.create(request);
    }

    @PutMapping("/{id}")
    public ScreeningScheduleRowResponse update(@PathVariable Long id,
                                               @Valid @RequestBody ScreeningCreateRequest request) {
        return screeningService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        screeningService.delete(id);
    }
}
