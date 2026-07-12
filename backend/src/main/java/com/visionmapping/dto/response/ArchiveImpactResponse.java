package com.visionmapping.dto.response;

/**
 * What an archive would cascade to: counts of the not-yet-archived
 * descendants that would be archived along with the target record. Zeroes
 * for levels below the target's own children.
 */
public record ArchiveImpactResponse(long dreams, long goals, long steps, long tasks) {
}
