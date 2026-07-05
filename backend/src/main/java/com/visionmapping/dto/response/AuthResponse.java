package com.visionmapping.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String role
) {
}
