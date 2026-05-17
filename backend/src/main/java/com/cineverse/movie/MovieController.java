package com.cineverse.movie;

import com.cineverse.common.pagination.CursorPage;
import com.cineverse.movie.dto.MovieRequest;
import com.cineverse.movie.dto.MovieResponse;
import com.cineverse.screening.ScreeningService;
import com.cineverse.screening.dto.ScreeningScheduleRowResponse;
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

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final ScreeningService screeningService;

    public MovieController(MovieService movieService, ScreeningService screeningService) {
        this.movieService = movieService;
        this.screeningService = screeningService;
    }

    @GetMapping
    public CursorPage<MovieResponse> list(@RequestParam(required = false) MovieStatus status,
                                          @RequestParam(required = false) String genres,
                                          @RequestParam(required = false) String q,
                                          @RequestParam(required = false) String cursor,
                                          @RequestParam(defaultValue = "20") int limit) throws Exception {
        return movieService.list(status, genres, q, cursor, limit);
    }

    @GetMapping("/{id}")
    public MovieResponse get(@PathVariable Long id) {
        return movieService.getById(id);
    }

    @GetMapping("/{id}/screenings")
    public List<ScreeningScheduleRowResponse> screenings(@PathVariable Long id) {
        return screeningService.listScreeningsForMovie(id);
    }

    @PostMapping
    public MovieResponse create(@Valid @RequestBody MovieRequest request) {
        return movieService.create(request);
    }

    @PutMapping("/{id}")
    public MovieResponse update(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return movieService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        movieService.delete(id);
    }
}
