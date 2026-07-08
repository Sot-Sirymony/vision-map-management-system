package com.visionmapping.repository;

import com.visionmapping.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUser_Id(Long userId);

    List<Review> findByUser_IdAndArchivedFalse(Long userId);
}
