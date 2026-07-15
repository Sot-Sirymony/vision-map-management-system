package com.visionmapping.repository;

import com.visionmapping.entity.ProgressLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long>, UserScopedRepository<ProgressLog> {

    List<ProgressLog> findByRelatedTask_IdAndUser_Id(Long taskId, Long userId);
}
