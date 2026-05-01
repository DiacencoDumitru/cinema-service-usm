package com.cineverse.movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    @Query(value = """
            SELECT DISTINCT m.* FROM movies m
            WHERE (:status IS NULL OR m.status = CAST(:status AS VARCHAR))
              AND (
                  CAST(:genreCsv AS TEXT) IS NULL OR CAST(:genreCsv AS TEXT) = ''
                  OR EXISTS (
                      SELECT 1 FROM unnest(m.genres) AS mg
                      INNER JOIN unnest(string_to_array(CAST(:genreCsv AS TEXT), ',')) AS rf
                          ON lower(trim(mg)) = lower(trim(rf))
                      WHERE trim(rf) <> ''
                  )
              )
              AND (:cursorId IS NULL OR m.id < :cursorId)
            ORDER BY m.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Movie> findPageNative(
            @Param("status") String status,
            @Param("genreCsv") String genreCsv,
            @Param("cursorId") Long cursorId,
            @Param("limit") int limit
    );
}
