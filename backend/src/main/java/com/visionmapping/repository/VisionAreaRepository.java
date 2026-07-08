package com.visionmapping.repository;

import com.visionmapping.entity.VisionArea;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisionAreaRepository extends JpaRepository<VisionArea, Long> {

    List<VisionArea> findByUser_Id(Long userId);

    List<VisionArea> findByUser_IdAndArchivedFalse(Long userId);
}
