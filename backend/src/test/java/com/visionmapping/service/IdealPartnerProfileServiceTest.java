package com.visionmapping.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.visionmapping.dto.request.IdealPartnerProfileRequest;
import com.visionmapping.dto.response.IdealPartnerProfileResponse;
import com.visionmapping.entity.AppUser;
import com.visionmapping.entity.IdealPartnerProfile;
import com.visionmapping.entity.VisionStep;
import com.visionmapping.entity.enums.Priority;
import com.visionmapping.entity.enums.UserRole;
import com.visionmapping.entity.enums.UserStatus;
import com.visionmapping.entity.enums.WorkStatus;
import com.visionmapping.exception.BusinessRuleException;
import com.visionmapping.exception.ResourceNotFoundException;
import com.visionmapping.mapper.VisionMappingMapper;
import com.visionmapping.repository.CommunicationMessageRepository;
import com.visionmapping.repository.DreamRepository;
import com.visionmapping.repository.GoalRepository;
import com.visionmapping.repository.IdealPartnerProfileRepository;
import com.visionmapping.repository.ObstacleRepository;
import com.visionmapping.repository.PartnerRepository;
import com.visionmapping.repository.ProgressLogRepository;
import com.visionmapping.repository.ReviewRepository;
import com.visionmapping.repository.TaskItemRepository;
import com.visionmapping.repository.VisionAreaRepository;
import com.visionmapping.repository.VisionStepRepository;
import com.visionmapping.service.support.ArchiveCascade;
import com.visionmapping.service.support.EntityLookup;
import com.visionmapping.util.UserScope;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IdealPartnerProfileServiceTest {

    @Mock private UserScope userScope;
    @Mock private VisionAreaRepository visionAreaRepository;
    @Mock private DreamRepository dreamRepository;
    @Mock private GoalRepository goalRepository;
    @Mock private VisionStepRepository visionStepRepository;
    @Mock private TaskItemRepository taskItemRepository;
    @Mock private PartnerRepository partnerRepository;
    @Mock private CommunicationMessageRepository communicationMessageRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private ObstacleRepository obstacleRepository;
    @Mock private ProgressLogRepository progressLogRepository;
    @Mock private IdealPartnerProfileRepository idealPartnerProfileRepository;

    private IdealPartnerProfileService service;
    private ArchiveCascade archiveCascade;
    private AppUser testUser;
    private AppUser otherUser;

    @BeforeEach
    void setUp() {
        EntityLookup lookup = new EntityLookup(userScope, visionAreaRepository, dreamRepository, goalRepository,
                visionStepRepository, taskItemRepository, partnerRepository, communicationMessageRepository,
                reviewRepository, obstacleRepository, progressLogRepository);
        service = new IdealPartnerProfileService(lookup, new VisionMappingMapper(), idealPartnerProfileRepository);
        archiveCascade = new ArchiveCascade(lookup, dreamRepository, goalRepository,
                visionStepRepository, taskItemRepository, idealPartnerProfileRepository);
        testUser = AppUser.builder().id(1L).fullName("Test User").email("test@example.com")
                .passwordHash("hash").role(UserRole.USER).status(UserStatus.ACTIVE).build();
        otherUser = AppUser.builder().id(2L).fullName("Other User").email("other@example.com")
                .passwordHash("hash").role(UserRole.USER).status(UserStatus.ACTIVE).build();
        lenient().when(userScope.currentUser()).thenReturn(testUser);
    }

    private VisionStep step(Long id, AppUser owner) {
        return VisionStep.builder().id(id).user(owner).code("S-001").title("Search literature")
                .sequenceNumber(1).complex(true).priority(Priority.HIGH).status(WorkStatus.IN_PROGRESS)
                .progressPercent(BigDecimal.ZERO).build();
    }

    private IdealPartnerProfile profile(Long id, VisionStep step) {
        return IdealPartnerProfile.builder().id(id).user(testUser).step(step)
                .requiredExperience("Systematic reviews").characterTraits("Patient")
                .motivation("Shared publication").offerInReturn("Co-authorship").build();
    }

    @Test
    void createProfileSavesItForTheStep() {
        VisionStep step = step(10L, testUser);
        when(visionStepRepository.findById(10L)).thenReturn(Optional.of(step));
        when(idealPartnerProfileRepository.findByStep_IdAndUser_Id(10L, 1L)).thenReturn(Optional.empty());
        when(idealPartnerProfileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        IdealPartnerProfileResponse response = service.createProfile(
                new IdealPartnerProfileRequest(10L, "Systematic reviews", "Patient", "Shared publication", "Co-authorship"));

        assertThat(response.stepId()).isEqualTo(10L);
        assertThat(response.requiredExperience()).isEqualTo("Systematic reviews");
    }

    @Test
    void secondProfileForTheSameStepIsRejected() {
        VisionStep step = step(10L, testUser);
        when(visionStepRepository.findById(10L)).thenReturn(Optional.of(step));
        when(idealPartnerProfileRepository.findByStep_IdAndUser_Id(10L, 1L))
                .thenReturn(Optional.of(profile(5L, step)));

        assertThatThrownBy(() -> service.createProfile(
                new IdealPartnerProfileRequest(10L, null, null, null, null)))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void anotherUsersProfileIsNotFound() {
        VisionStep foreignStep = step(20L, otherUser);
        IdealPartnerProfile foreignProfile = IdealPartnerProfile.builder().id(7L).user(otherUser).step(foreignStep).build();
        when(idealPartnerProfileRepository.findById(7L)).thenReturn(Optional.of(foreignProfile));

        assertThatThrownBy(() -> service.getProfile(7L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void archivingAStepArchivesItsProfile() {
        VisionStep step = step(10L, testUser);
        IdealPartnerProfile stepProfile = profile(5L, step);
        when(taskItemRepository.findByStep_IdAndUser_Id(10L, 1L)).thenReturn(List.of());
        when(idealPartnerProfileRepository.findByStep_IdAndUser_Id(10L, 1L)).thenReturn(Optional.of(stepProfile));

        archiveCascade.archiveTasksUnder(step.getId());

        assertThat(stepProfile.isArchived()).isTrue();
    }
}
