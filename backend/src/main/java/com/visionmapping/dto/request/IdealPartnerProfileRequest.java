package com.visionmapping.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IdealPartnerProfileRequest(
        @NotNull Long stepId,
        @Size(max = 2000) String requiredExperience,
        @Size(max = 2000) String characterTraits,
        @Size(max = 2000) String motivation,
        @Size(max = 2000) String offerInReturn
) {
}
