package com.visionmapping.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProgressLogRequest(
        @NotNull Long relatedTaskId,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal progressPercentBefore,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal progressPercentAfter,
        @Size(max = 2000) String note
) {
}
