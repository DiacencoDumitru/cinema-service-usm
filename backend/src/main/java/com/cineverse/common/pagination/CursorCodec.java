package com.cineverse.common.pagination;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

public final class CursorCodec {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private CursorCodec() {
    }

    private record IdCursor(Long id) {
    }

    private record ScreeningCursor(Instant ts, Long id) {
    }

    public static String encodeId(Long id) throws IOException {
        return encodeJson(new IdCursor(id));
    }

    public static Long decodeId(String cursor) throws IOException {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }
        return decodeJson(cursor, IdCursor.class).id();
    }

    public static String encodeScreening(Instant ts, Long id) throws IOException {
        return encodeJson(new ScreeningCursor(ts, id));
    }

    public static ScreeningCursorDecoded decodeScreening(String cursor) throws IOException {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }
        ScreeningCursor sc = decodeJson(cursor, ScreeningCursor.class);
        return new ScreeningCursorDecoded(sc.ts(), sc.id());
    }

    public record ScreeningCursorDecoded(Instant ts, Long id) {
    }

    private static String encodeJson(Object value) throws IOException {
        String json = MAPPER.writeValueAsString(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private static <T> T decodeJson(String cursor, Class<T> type) throws IOException {
        byte[] raw = Base64.getUrlDecoder().decode(cursor);
        return MAPPER.readValue(raw, type);
    }
}
