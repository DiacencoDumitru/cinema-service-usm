package com.cineverse.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotBlank String confirmPassword
) {
    @AssertTrue(message = "Passwords must match")
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
}
