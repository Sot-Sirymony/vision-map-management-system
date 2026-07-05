package com.visionmapping.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record ProgressLogResponse(
        Long id,
        Long relatedTaskId,
        BigDecimal progressPercentBefore,
        BigDecimal progressPercentAfter,
        String note,
        Instant loggedAt,
        boolean archived
) {
}
