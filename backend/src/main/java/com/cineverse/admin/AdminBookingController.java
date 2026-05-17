package com.cineverse.admin;

import com.cineverse.auth.UserPrincipal;
import com.cineverse.booking.BookingService;
import com.cineverse.booking.dto.AdminBookingRowResponse;
import com.cineverse.common.pagination.CursorPage;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public CursorPage<AdminBookingRowResponse> list(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) throws Exception {
        return bookingService.listAdminBookings(movieId, date, cursor, limit);
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) throws Exception {
        String csv = bookingService.exportAdminBookingsCsv(movieId, date);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        bookingService.cancelBooking(principal.getUserId(), id, true);
    }
}
