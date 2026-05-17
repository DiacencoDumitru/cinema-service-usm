package com.cineverse.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, BookingSeatId> {

    boolean existsBySeatIdAndBooking_Status(Long seatId, BookingStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(bs) > 0 THEN true ELSE false END
            FROM BookingSeat bs
            WHERE bs.seat.id = :seatId AND bs.booking.status IN :statuses
            """)
    boolean existsBySeatIdAndBooking_StatusIn(@Param("seatId") Long seatId,
                                              @Param("statuses") Collection<BookingStatus> statuses);
}
