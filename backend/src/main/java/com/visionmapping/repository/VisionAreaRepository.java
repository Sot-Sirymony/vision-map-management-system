package com.visionmapping.repository;

import com.visionmapping.entity.VisionArea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisionAreaRepository extends JpaRepository<VisionArea, Long>, UserScopedRepository<VisionArea> {
}
