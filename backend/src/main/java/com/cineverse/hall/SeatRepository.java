package com.cineverse.hall;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHallIdOrderByRowNumAscColNumAsc(Long hallId);

    @Query("SELECT s FROM Seat s JOIN FETCH s.hall WHERE s.id IN :ids")
    List<Seat> findByIdInWithHall(@Param("ids") Collection<Long> ids);
}
