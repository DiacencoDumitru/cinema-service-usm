package com.cineverse.hall;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHallIdOrderByRowNumAscColNumAsc(Long hallId);

    List<Seat> findByIdIn(Collection<Long> ids);
}
