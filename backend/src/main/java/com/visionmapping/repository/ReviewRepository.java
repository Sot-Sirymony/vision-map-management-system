package com.visionmapping.repository;

import com.visionmapping.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long>, UserScopedRepository<Review> {
}
