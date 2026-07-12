package com.visionmapping.service;

import static com.visionmapping.service.support.ServiceSupport.requireArchived;

import com.visionmapping.dto.request.ReviewRequest;
import com.visionmapping.dto.response.ReviewResponse;
import com.visionmapping.entity.Review;
import com.visionmapping.exception.BusinessRuleException;
import com.visionmapping.mapper.VisionMappingMapper;
import com.visionmapping.repository.ReviewRepository;
import com.visionmapping.service.support.EntityLookup;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Daily/weekly/monthly reviews, including the FR-16 diligence checklist that
 * must be answered as a whole or skipped as a whole.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ReviewService {

    private final EntityLookup lookup;
    private final VisionMappingMapper mapper;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> listReviews(boolean includeArchived) {
        List<Review> entities = includeArchived
                ? reviewRepository.findByUser_Id(lookup.userId())
                : reviewRepository.findByUser_IdAndArchivedFalse(lookup.userId());
        return entities.stream().map(mapper::toResponse).toList();
    }

    public ReviewResponse createReview(ReviewRequest request) {
        validateDiligenceChecklist(request);
        Review entity = Review.builder()
                .user(lookup.currentUser())
                .reviewType(request.reviewType())
                .reviewDate(request.reviewDate())
                .relatedVisionArea(lookup.optionalVisionArea(request.relatedVisionAreaId()))
                .relatedDream(lookup.optionalDream(request.relatedDreamId()))
                .summary(request.summary())
                .completedTasks(request.completedTasks())
                .delayedTasks(request.delayedTasks())
                .blockedTasks(request.blockedTasks())
                .lessonsLearned(request.lessonsLearned())
                .nextActions(request.nextActions())
                .diligenceClearVision(request.diligenceClearVision())
                .diligenceWorkedPlan(request.diligenceWorkedPlan())
                .diligenceUsedLeverage(request.diligenceUsedLeverage())
                .diligencePriorityFirst(request.diligencePriorityFirst())
                .diligenceSmarterRoute(request.diligenceSmarterRoute())
                .diligenceNote(request.diligenceNote())
                .build();
        return mapper.toResponse(reviewRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReview(Long id) {
        return mapper.toResponse(lookup.review(id));
    }

    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        validateDiligenceChecklist(request);
        Review entity = lookup.review(id);
        entity.setReviewType(request.reviewType());
        entity.setReviewDate(request.reviewDate());
        entity.setRelatedVisionArea(lookup.optionalVisionArea(request.relatedVisionAreaId()));
        entity.setRelatedDream(lookup.optionalDream(request.relatedDreamId()));
        entity.setSummary(request.summary());
        entity.setCompletedTasks(request.completedTasks());
        entity.setDelayedTasks(request.delayedTasks());
        entity.setBlockedTasks(request.blockedTasks());
        entity.setLessonsLearned(request.lessonsLearned());
        entity.setNextActions(request.nextActions());
        entity.setDiligenceClearVision(request.diligenceClearVision());
        entity.setDiligenceWorkedPlan(request.diligenceWorkedPlan());
        entity.setDiligenceUsedLeverage(request.diligenceUsedLeverage());
        entity.setDiligencePriorityFirst(request.diligencePriorityFirst());
        entity.setDiligenceSmarterRoute(request.diligenceSmarterRoute());
        entity.setDiligenceNote(request.diligenceNote());
        return mapper.toResponse(entity);
    }

    public void archiveReview(Long id) {
        lookup.review(id).setArchived(true);
    }

    public void restoreReview(Long id) {
        lookup.review(id).setArchived(false);
    }

    public void permanentlyDeleteReview(Long id) {
        Review review = lookup.review(id);
        requireArchived(review.isArchived(), "Review");
        reviewRepository.delete(review);
    }

    /**
     * FR-16: the diligence checklist is answered as a whole or skipped as a
     * whole — a half-answered checklist would silently read as "not met" on
     * the unanswered questions.
     */
    private void validateDiligenceChecklist(ReviewRequest request) {
        List<Boolean> answers = new ArrayList<>();
        answers.add(request.diligenceClearVision());
        answers.add(request.diligenceWorkedPlan());
        answers.add(request.diligenceUsedLeverage());
        answers.add(request.diligencePriorityFirst());
        answers.add(request.diligenceSmarterRoute());
        long answered = answers.stream().filter(Objects::nonNull).count();
        if (answered != 0 && answered != answers.size()) {
            throw new BusinessRuleException("Answer every diligence question, or skip the whole checklist.");
        }
    }
}
