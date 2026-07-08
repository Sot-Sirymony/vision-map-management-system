package com.visionmapping.dto.response;

import com.visionmapping.entity.enums.PartnerStatus;
import com.visionmapping.entity.enums.PartnerSupportType;
import java.time.Instant;

public record PartnerResponse(
        Long id,
        String code,
        String name,
        String role,
        String organization,
        String email,
        String phone,
        String strength,
        PartnerSupportType supportType,
        Long relatedVisionAreaId,
        Long relatedDreamId,
        Long relatedGoalId,
        Long relatedStepId,
        Long relatedTaskId,
        PartnerStatus status,
        String notes,
        boolean archived,
        Instant createdAt,
        Instant updatedAt
) {
}
