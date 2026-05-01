package com.cineverse.screening;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    boolean existsByHall_IdAndStartsAt(Long hallId, Instant startsAt);

    boolean existsByHall_IdAndStartsAtAndIdNot(Long hallId, Instant startsAt, Long id);

    @Query("""
            SELECT DISTINCT s FROM Screening s
            JOIN FETCH s.movie m
            JOIN FETCH s.hall h
            WHERE s.startsAt >= :dayStart AND s.startsAt < :dayEnd
            ORDER BY s.startsAt ASC, s.id ASC
            """)
    List<Screening> findForDay(@Param("dayStart") Instant dayStart, @Param("dayEnd") Instant dayEnd);

    @Query("""
            SELECT s FROM Screening s
            JOIN FETCH s.movie
            JOIN FETCH s.hall
            WHERE s.movie.id = :movieId
            ORDER BY s.startsAt ASC
            """)
    List<Screening> findScreeningsForMovie(@Param("movieId") Long movieId);

    @Query("SELECT s FROM Screening s JOIN FETCH s.movie JOIN FETCH s.hall WHERE s.id = :id")
    Optional<Screening> findByIdWithMovieAndHall(@Param("id") Long id);
}
