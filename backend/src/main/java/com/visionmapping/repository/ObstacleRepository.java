package com.visionmapping.repository;

import com.visionmapping.entity.Obstacle;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObstacleRepository extends JpaRepository<Obstacle, Long> {

    List<Obstacle> findByUser_Id(Long userId);
}
