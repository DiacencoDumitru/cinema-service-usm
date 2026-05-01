package com.cineverse.hall;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HallRepository extends JpaRepository<Hall, Long> {

    @Query(value = """
            SELECT * FROM halls
            WHERE (:cursorId IS NULL OR id > :cursorId)
            ORDER BY id ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<Hall> findPage(@Param("cursorId") Long cursorId, @Param("limit") int limit);
}
