package com.visionmapping.dto.request;

import jakarta.validation.constraints.NotBlank;

public record StatusUpdateRequest(
        @NotBlank String status,
        boolean manualOverride
) {
}
