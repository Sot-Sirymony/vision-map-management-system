package com.visionmapping.entity;

import com.visionmapping.entity.enums.PartnerStatus;
import com.visionmapping.entity.enums.PartnerSupportType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "partners")
public class Partner extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(length = 120)
    private String role;

    @Column(length = 180)
    private String organization;

    @Column(length = 180)
    private String email;

    @Column(length = 60)
    private String phone;

    @Column(length = 120)
    private String strength;

    @Enumerated(EnumType.STRING)
    @Column(name = "support_type", nullable = false, length = 40)
    private PartnerSupportType supportType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_vision_area_id")
    private VisionArea relatedVisionArea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_dream_id")
    private Dream relatedDream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_goal_id")
    private Goal relatedGoal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_step_id")
    private VisionStep relatedStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_task_id")
    private TaskItem relatedTask;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PartnerStatus status;

    @Column(length = 3000)
    private String notes;

    @Column(nullable = false)
    private boolean archived;
}
