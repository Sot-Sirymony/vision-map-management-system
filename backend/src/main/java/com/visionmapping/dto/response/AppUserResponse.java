package com.visionmapping.dto.response;

import com.visionmapping.entity.enums.UserRole;
import com.visionmapping.entity.enums.UserStatus;
import java.time.Instant;

public record AppUserResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        UserStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
