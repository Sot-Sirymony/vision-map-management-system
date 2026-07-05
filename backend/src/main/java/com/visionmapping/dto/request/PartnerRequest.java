package com.visionmapping.dto.request;

import com.visionmapping.entity.enums.PartnerStatus;
import com.visionmapping.entity.enums.PartnerSupportType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PartnerRequest(
        @NotBlank @Size(max = 180) String name,
        @Size(max = 120) String role,
        @Size(max = 180) String organization,
        @Email @Size(max = 180) String email,
        @Size(max = 60) String phone,
        @Size(max = 120) String strength,
        @NotNull PartnerSupportType supportType,
        Long relatedVisionAreaId,
        Long relatedDreamId,
        Long relatedGoalId,
        Long relatedStepId,
        Long relatedTaskId,
        @NotNull PartnerStatus status,
        @Size(max = 3000) String notes
) {
}
