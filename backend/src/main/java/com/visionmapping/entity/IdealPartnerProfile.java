package com.visionmapping.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The partner a step needs, written down before anyone is recruited (FR-15.1).
 * One profile per step; it is archived with its step (BR-13).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ideal_partner_profiles")
public class IdealPartnerProfile extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "step_id", nullable = false, unique = true)
    private VisionStep step;

    @Column(name = "required_experience", length = 2000)
    private String requiredExperience;

    @Column(name = "character_traits", length = 2000)
    private String characterTraits;

    @Column(length = 2000)
    private String motivation;

    @Column(name = "offer_in_return", length = 2000)
    private String offerInReturn;

    @Column(nullable = false)
    private boolean archived;
}
