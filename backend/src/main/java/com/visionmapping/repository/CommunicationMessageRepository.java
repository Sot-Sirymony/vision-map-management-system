package com.visionmapping.repository;

import com.visionmapping.entity.CommunicationMessage;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunicationMessageRepository extends JpaRepository<CommunicationMessage, Long> {

    List<CommunicationMessage> findByUser_Id(Long userId);

    Page<CommunicationMessage> findByUser_Id(Long userId, Pageable pageable);

    Page<CommunicationMessage> findByUser_IdAndArchivedFalse(Long userId, Pageable pageable);
}
