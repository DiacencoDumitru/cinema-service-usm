package com.cineverse.booking;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByScreening_Id(Long screeningId);

    boolean existsByBookingCode(String bookingCode);

    @EntityGraph(attributePaths = {"seats", "seats.seat", "screening", "screening.movie", "screening.hall"})
    @Query("""
            SELECT b FROM Booking b
            WHERE b.user.id = :userId
              AND (:cursorId IS NULL OR b.id < :cursorId)
            ORDER BY b.id DESC
            """)
    List<Booking> findUserBookings(@Param("userId") Long userId, @Param("cursorId") Long cursorId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "screening", "screening.movie", "screening.hall"})
    @Query("""
            SELECT b FROM Booking b
            WHERE (:movieId IS NULL OR b.screening.movie.id = :movieId)
              AND (:dayStart IS NULL OR b.screening.startsAt >= :dayStart)
              AND (:dayEnd IS NULL OR b.screening.startsAt < :dayEnd)
              AND (:cursorId IS NULL OR b.id < :cursorId)
            ORDER BY b.id DESC
            """)
    List<Booking> findAdminPage(
            @Param("movieId") Long movieId,
            @Param("dayStart") Instant dayStart,
            @Param("dayEnd") Instant dayEnd,
            @Param("cursorId") Long cursorId,
            Pageable pageable
    );

    @Query("SELECT b FROM Booking b JOIN FETCH b.screening s JOIN FETCH s.movie JOIN FETCH s.hall JOIN FETCH b.user WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"seats", "seats.seat", "screening", "screening.movie", "screening.hall"})
    @Query("SELECT b FROM Booking b WHERE b.id = :id AND b.user.id = :userId")
    Optional<Booking> findByIdForUser(@Param("id") Long id, @Param("userId") Long userId);
}
