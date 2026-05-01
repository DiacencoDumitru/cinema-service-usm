package com.cineverse.user.dto;

import com.cineverse.user.Role;

public record ProfileResponse(Long id, String name, String email, Role role) {
}
