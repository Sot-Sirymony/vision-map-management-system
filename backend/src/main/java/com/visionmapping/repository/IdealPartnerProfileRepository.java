package com.visionmapping.repository;

import com.visionmapping.entity.IdealPartnerProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdealPartnerProfileRepository extends JpaRepository<IdealPartnerProfile, Long>, UserScopedRepository<IdealPartnerProfile> {

    Optional<IdealPartnerProfile> findByStep_IdAndUser_Id(Long stepId, Long userId);
}
