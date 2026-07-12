package com.visionmapping.service;

import com.visionmapping.dto.request.ProgressLogRequest;
import com.visionmapping.dto.response.ProgressLogResponse;
import com.visionmapping.entity.AppUser;
import com.visionmapping.entity.ProgressLog;
import com.visionmapping.entity.TaskItem;
import com.visionmapping.entity.enums.WorkStatus;
import com.visionmapping.mapper.VisionMappingMapper;
import com.visionmapping.repository.ProgressLogRepository;
import com.visionmapping.service.support.EntityLookup;
import com.visionmapping.service.support.ProgressCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records point-in-time progress notes against a task. Logging progress also
 * advances the task itself (and rolls the change up its step and goal), so a
 * log is both a history entry and the trigger for a recalculation.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ProgressLogService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100).setScale(2, RoundingMode.HALF_UP);

    private final EntityLookup lookup;
    private final ProgressCalculator progress;
    private final VisionMappingMapper mapper;
    private final ProgressLogRepository progressLogRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<ProgressLogResponse> listProgressLogs() {
        return progressLogRepository.findByUser_IdAndArchivedFalse(lookup.userId()).stream().map(mapper::toResponse).toList();
    }

    public ProgressLogResponse createProgressLog(ProgressLogRequest request) {
        AppUser user = lookup.currentUser();
        TaskItem task = lookup.task(request.relatedTaskId());
        ProgressLog entity = ProgressLog.builder()
                .user(user)
                .relatedTask(task)
                .progressPercentBefore(progress.normalizeProgress(request.progressPercentBefore()))
                .progressPercentAfter(progress.normalizeProgress(request.progressPercentAfter()))
                .note(request.note())
                .loggedAt(Instant.now(clock))
                .build();
        task.setProgressPercent(entity.getProgressPercentAfter());
        if (ONE_HUNDRED.compareTo(entity.getProgressPercentAfter()) == 0) {
            task.setStatus(WorkStatus.COMPLETED);
            task.setCompletedAt(Instant.now(clock));
        }
        progress.recalculateStep(task.getStep());
        return mapper.toResponse(progressLogRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public ProgressLogResponse getProgressLog(Long id) {
        return mapper.toResponse(lookup.progressLog(id));
    }

    public void archiveProgressLog(Long id) {
        lookup.progressLog(id).setArchived(true);
    }
}
