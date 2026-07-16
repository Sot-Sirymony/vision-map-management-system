package com.visionmapping.dto.response;

import java.time.Instant;

public record IdealPartnerProfileResponse(
        Long id,
        Long stepId,
        String requiredExperience,
        String characterTraits,
        String motivation,
        String offerInReturn,
        boolean archived,
        Instant createdAt,
        Instant updatedAt
) {
}
