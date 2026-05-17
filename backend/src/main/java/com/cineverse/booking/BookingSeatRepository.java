package com.cineverse.booking;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, BookingSeatId> {

    boolean existsBySeatIdAndBooking_Status(Long seatId, BookingStatus status);
}
