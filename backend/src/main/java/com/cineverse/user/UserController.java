package com.cineverse.user;

import com.cineverse.auth.UserPrincipal;
import com.cineverse.booking.BookingService;
import com.cineverse.booking.dto.BookingDetailResponse;
import com.cineverse.booking.dto.BookingHistoryResponse;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.user.dto.ProfileResponse;
import com.cineverse.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final BookingService bookingService;

    public UserController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping("/profile")
    public ProfileResponse profile(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getProfile(principal);
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                         @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal, request);
    }

    @GetMapping("/bookings")
    public CursorPage<BookingHistoryResponse> bookings(@AuthenticationPrincipal UserPrincipal principal,
                                                       @RequestParam(required = false) String cursor,
                                                       @RequestParam(defaultValue = "20") int limit) throws Exception {
        return bookingService.listUserBookings(principal.getUserId(), cursor, limit);
    }

    @GetMapping("/bookings/{id}")
    public BookingDetailResponse booking(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id) {
        return bookingService.getUserBooking(principal.getUserId(), id);
    }
}
