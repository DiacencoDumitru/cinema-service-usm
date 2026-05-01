package com.cineverse.hall;

import com.cineverse.cache.RedisCacheEvictionService;
import com.cineverse.common.ApiException;
import com.cineverse.common.pagination.CursorCodec;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.hall.dto.HallCreateRequest;
import com.cineverse.hall.dto.HallResponse;
import com.cineverse.hall.dto.HallUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HallService {

    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final RedisCacheEvictionService cacheEvictionService;

    public HallService(HallRepository hallRepository,
                       SeatRepository seatRepository,
                       RedisCacheEvictionService cacheEvictionService) {
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.cacheEvictionService = cacheEvictionService;
    }

    public CursorPage<HallResponse> list(String cursor, int limit) throws Exception {
        Long cursorId = CursorCodec.decodeId(cursor);
        List<Hall> rows = hallRepository.findPage(cursorId, limit + 1);
        boolean hasMore = rows.size() > limit;
        List<Hall> page = hasMore ? rows.subList(0, limit) : rows;
        String next = null;
        if (hasMore && !page.isEmpty()) {
            next = CursorCodec.encodeId(page.get(page.size() - 1).getId());
        }
        return new CursorPage<>(page.stream().map(this::toDto).collect(Collectors.toList()), next, hasMore);
    }

    @Transactional
    public HallResponse create(HallCreateRequest request) {
        Hall hall = new Hall();
        hall.setName(request.name());
        hall.setRowsCount(request.rowsCount());
        hall.setSeatsPerRow(request.seatsPerRow());
        hallRepository.save(hall);
        regenerateSeats(hall, request.vipRows());
        cacheEvictionService.evictMovieAndScheduleCaches();
        return toDto(hallRepository.findById(hall.getId()).orElseThrow());
    }

    @Transactional
    public HallResponse update(Long id, HallUpdateRequest request) {
        Hall hall = hallRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Hall not found"));
        hall.setName(request.name());
        hall.setRowsCount(request.rowsCount());
        hall.setSeatsPerRow(request.seatsPerRow());
        hallRepository.save(hall);
        seatRepository.deleteAll(seatRepository.findByHallIdOrderByRowNumAscColNumAsc(hall.getId()));
        regenerateSeats(hall, request.vipRows());
        cacheEvictionService.evictMovieAndScheduleCaches();
        return toDto(hallRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void delete(Long id) {
        if (!hallRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Hall not found");
        }
        hallRepository.deleteById(id);
        cacheEvictionService.evictMovieAndScheduleCaches();
    }

    private void regenerateSeats(Hall hall, List<Integer> vipRows) {
        Set<Integer> vip = vipRows == null ? Set.of() : new HashSet<>(vipRows);
        for (int r = 1; r <= hall.getRowsCount(); r++) {
            SeatType type = vip.contains(r) ? SeatType.VIP : SeatType.STANDARD;
            for (int c = 1; c <= hall.getSeatsPerRow(); c++) {
                Seat seat = new Seat();
                seat.setHall(hall);
                seat.setRowNum(r);
                seat.setColNum(c);
                seat.setSeatType(type);
                seatRepository.save(seat);
            }
        }
    }

    private HallResponse toDto(Hall h) {
        List<Integer> vipRows = seatRepository.findByHallIdOrderByRowNumAscColNumAsc(h.getId()).stream()
                .filter(seat -> seat.getSeatType() == SeatType.VIP)
                .map(Seat::getRowNum)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return new HallResponse(h.getId(), h.getName(), h.getRowsCount(), h.getSeatsPerRow(), vipRows);
    }
}
