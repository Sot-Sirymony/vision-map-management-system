package com.visionmapping.dto.response;

import com.visionmapping.entity.enums.ReviewType;
import java.time.Instant;
import java.time.LocalDate;

public record ReviewResponse(
        Long id,
        ReviewType reviewType,
        LocalDate reviewDate,
        Long relatedVisionAreaId,
        Long relatedDreamId,
        String summary,
        String completedTasks,
        String delayedTasks,
        String blockedTasks,
        String lessonsLearned,
        String nextActions,
        boolean archived,
        Instant createdAt,
        Instant updatedAt
) {
}
