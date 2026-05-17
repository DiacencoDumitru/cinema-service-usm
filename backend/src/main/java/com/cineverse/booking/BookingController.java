package com.cineverse.booking;

import com.cineverse.auth.UserPrincipal;
import com.cineverse.booking.dto.BookingPaidResponse;
import com.cineverse.booking.dto.BookingSeatSelectionRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/lock")
    public void lock(@AuthenticationPrincipal UserPrincipal principal,
                     @Valid @RequestBody BookingSeatSelectionRequest request) {
        bookingService.lockSeats(principal.getUserId(), request);
    }

    @PostMapping
    public BookingPaidResponse pay(@AuthenticationPrincipal UserPrincipal principal,
                                   @Valid @RequestBody BookingSeatSelectionRequest request) {
        return bookingService.pay(principal.getUserId(), request);
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@AuthenticationPrincipal UserPrincipal principal,
                       @PathVariable Long id) {
        bookingService.cancelBooking(principal.getUserId(), id, false);
    }
}
