package com.visionmapping.dto.response;

import com.visionmapping.entity.enums.Priority;
import com.visionmapping.entity.enums.WorkStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String code,
        Long dreamId,
        String title,
        String description,
        String successCriteria,
        Priority priority,
        LocalDate targetDate,
        WorkStatus status,
        BigDecimal progressPercent,
        boolean manualProgressOverride,
        Instant createdAt,
        Instant updatedAt
) {
}
