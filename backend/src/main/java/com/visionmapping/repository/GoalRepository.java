package com.visionmapping.repository;

import com.visionmapping.entity.Goal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser_Id(Long userId);

    List<Goal> findByUser_IdAndArchivedFalse(Long userId);

    List<Goal> findByDream_IdAndUser_Id(Long dreamId, Long userId);
}
