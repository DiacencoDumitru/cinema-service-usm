package com.cineverse.user.dto;

import com.cineverse.user.Role;

import java.time.LocalDate;

public record ProfileResponse(Long id, String name, String email, Role role, LocalDate birthDate) {
}
