package com.visionmapping.repository;

import com.visionmapping.entity.TaskItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {

    List<TaskItem> findByUser_Id(Long userId);

    List<TaskItem> findByStep_IdAndUser_Id(Long stepId, Long userId);
}
