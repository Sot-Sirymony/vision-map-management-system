package com.visionmapping.service.support;

import com.visionmapping.dto.response.ArchiveImpactResponse;
import com.visionmapping.entity.Dream;
import com.visionmapping.entity.Goal;
import com.visionmapping.entity.TaskItem;
import com.visionmapping.entity.VisionArea;
import com.visionmapping.entity.VisionStep;
import com.visionmapping.entity.enums.DreamStatus;
import com.visionmapping.entity.enums.LifecycleStatus;
import com.visionmapping.repository.DreamRepository;
import com.visionmapping.repository.GoalRepository;
import com.visionmapping.repository.TaskItemRepository;
import com.visionmapping.repository.VisionStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Keeps the archive flag consistent down and up the hierarchy. Archiving a
 * record archives everything beneath it; restoring one pulls its archived
 * parents back with it (as Paused, since the pre-archive status is unknown).
 * The impact counts report only what a fresh archive would newly hide, so the
 * confirmation dialog never over-counts already-archived descendants.
 */
@Component
@RequiredArgsConstructor
public class ArchiveCascade {

    private final EntityLookup lookup;
    private final DreamRepository dreamRepository;
    private final GoalRepository goalRepository;
    private final VisionStepRepository visionStepRepository;
    private final TaskItemRepository taskItemRepository;

    // --- Down-cascade: archiving a parent archives its descendants -----------

    public void archiveDreamsUnder(Long visionAreaId) {
        for (Dream dream : dreamRepository.findByVisionArea_IdAndUser_Id(visionAreaId, lookup.userId())) {
            dream.setStatus(DreamStatus.ARCHIVED);
            dream.setArchived(true);
            archiveGoalsUnder(dream.getId());
        }
    }

    public void archiveGoalsUnder(Long dreamId) {
        for (Goal goal : goalRepository.findByDream_IdAndUser_Id(dreamId, lookup.userId())) {
            goal.setArchived(true);
            archiveStepsUnder(goal.getId());
        }
    }

    public void archiveStepsUnder(Long goalId) {
        for (VisionStep step : visionStepRepository.findByGoal_IdAndUser_Id(goalId, lookup.userId())) {
            step.setArchived(true);
            archiveTasksUnder(step.getId());
        }
    }

    public void archiveTasksUnder(Long stepId) {
        for (TaskItem task : taskItemRepository.findByStep_IdAndUser_Id(stepId, lookup.userId())) {
            task.setArchived(true);
        }
    }

    // --- Impact: how many not-yet-archived descendants a cascade would hide --

    public ArchiveImpactResponse impactOfVisionArea(VisionArea area) {
        long dreams = 0;
        long goals = 0;
        long steps = 0;
        long tasks = 0;
        for (Dream dream : dreamRepository.findByVisionArea_IdAndUser_Id(area.getId(), lookup.userId())) {
            if (!dream.isArchived()) {
                dreams++;
            }
            ArchiveImpactResponse below = impactOfDream(dream);
            goals += below.goals();
            steps += below.steps();
            tasks += below.tasks();
        }
        return new ArchiveImpactResponse(dreams, goals, steps, tasks);
    }

    public ArchiveImpactResponse impactOfDream(Dream dream) {
        long goals = 0;
        long steps = 0;
        long tasks = 0;
        for (Goal goal : goalRepository.findByDream_IdAndUser_Id(dream.getId(), lookup.userId())) {
            if (!goal.isArchived()) {
                goals++;
            }
            ArchiveImpactResponse below = impactOfGoal(goal);
            steps += below.steps();
            tasks += below.tasks();
        }
        return new ArchiveImpactResponse(0, goals, steps, tasks);
    }

    public ArchiveImpactResponse impactOfGoal(Goal goal) {
        long steps = 0;
        long tasks = 0;
        for (VisionStep step : visionStepRepository.findByGoal_IdAndUser_Id(goal.getId(), lookup.userId())) {
            if (!step.isArchived()) {
                steps++;
            }
            tasks += impactOfStep(step).tasks();
        }
        return new ArchiveImpactResponse(0, 0, steps, tasks);
    }

    public ArchiveImpactResponse impactOfStep(VisionStep step) {
        long tasks = taskItemRepository.findByStep_IdAndUser_Id(step.getId(), lookup.userId()).stream()
                .filter(task -> !task.isArchived())
                .count();
        return new ArchiveImpactResponse(0, 0, 0, tasks);
    }

    // --- Up-chain: restoring a child brings its archived parents back --------

    public void unarchiveVisionArea(VisionArea area) {
        if (area.isArchived()) {
            area.setArchived(false);
            // ARCHIVED was set by the archive cascade; the original status is
            // unknown, so come back as Paused rather than silently Active.
            if (area.getStatus() == LifecycleStatus.ARCHIVED) {
                area.setStatus(LifecycleStatus.PAUSED);
            }
        }
    }

    public void unarchiveDreamChain(Dream dream) {
        unarchiveVisionArea(dream.getVisionArea());
        if (dream.isArchived()) {
            dream.setArchived(false);
            if (dream.getStatus() == DreamStatus.ARCHIVED) {
                dream.setStatus(DreamStatus.PAUSED);
            }
        }
    }

    public void unarchiveGoalChain(Goal goal) {
        unarchiveDreamChain(goal.getDream());
        goal.setArchived(false);
    }
}
