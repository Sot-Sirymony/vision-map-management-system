package com.visionmapping.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardSummaryResponse(
        long totalVisionAreas,
        long activeDreams,
        long activeGoals,
        long activeTasks,
        long completedTasks,
        long overdueTasks,
        long blockedTasks,
        BigDecimal averageProgress,
        long tasksDueThisWeek,
        Map<String, Long> goalsByStatus,
        Map<String, Long> dreamsByVisionArea
) {
}
