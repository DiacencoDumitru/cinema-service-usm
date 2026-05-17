package com.cineverse.booking;

import java.security.SecureRandom;

public final class BookingCodeGenerator {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private BookingCodeGenerator() {
    }

    public static String generate() {
        StringBuilder sb = new StringBuilder("AC");
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
