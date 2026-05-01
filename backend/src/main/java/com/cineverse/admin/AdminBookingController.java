package com.cineverse.admin;

import com.cineverse.booking.BookingService;
import com.cineverse.booking.dto.AdminBookingRowResponse;
import com.cineverse.common.pagination.CursorPage;
import org.springframework.web.bind.annotation.GetMapping;
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
    public CursorPage<AdminBookingRowResponse> list(@RequestParam(required = false) Long movieId,
                                                    @RequestParam(required = false) LocalDate date,
                                                    @RequestParam(required = false) String cursor,
                                                    @RequestParam(defaultValue = "50") int limit) throws Exception {
        return bookingService.listAdminBookings(movieId, date, cursor, limit);
    }
}
