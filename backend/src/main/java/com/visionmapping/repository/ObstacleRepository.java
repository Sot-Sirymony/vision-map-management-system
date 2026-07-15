package com.visionmapping.repository;

import com.visionmapping.entity.Obstacle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObstacleRepository extends JpaRepository<Obstacle, Long>, UserScopedRepository<Obstacle> {
}
