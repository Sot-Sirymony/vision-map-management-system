package com.visionmapping.dto.response;

import com.visionmapping.entity.enums.ObstacleStatus;
import com.visionmapping.entity.enums.ObstacleType;
import com.visionmapping.entity.enums.Severity;
import java.time.Instant;

public record ObstacleResponse(
        Long id,
        Long relatedDreamId,
        Long relatedGoalId,
        Long relatedStepId,
        Long relatedTaskId,
        String title,
        String description,
        ObstacleType obstacleType,
        Severity severity,
        String solution,
        Long requiredPartnerId,
        ObstacleStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
