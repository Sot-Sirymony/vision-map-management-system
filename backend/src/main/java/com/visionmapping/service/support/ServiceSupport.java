package com.visionmapping.service.support;

import com.visionmapping.exception.BusinessRuleException;

/**
 * Stateless helpers every entity service shares: generating the next display
 * code, guarding a permanent delete, and parsing a status string into its
 * enum. Static because they hold no state and depend on nothing injectable.
 */
public final class ServiceSupport {

    private ServiceSupport() {
    }

    public static String nextCode(String prefix, int currentCount) {
        return "%s-%03d".formatted(prefix, currentCount + 1);
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static void requireArchived(boolean archived, String label) {
        if (!archived) {
            throw new BusinessRuleException(label + " must be archived before it can be permanently deleted.");
        }
    }

    public static <E extends Enum<E>> E parseEnum(Class<E> enumType, String status) {
        try {
            return Enum.valueOf(enumType, status.trim().toUpperCase().replace('-', '_').replace(' ', '_'));
        } catch (IllegalArgumentException exception) {
            throw new BusinessRuleException("Invalid status: " + status);
        }
    }
}
