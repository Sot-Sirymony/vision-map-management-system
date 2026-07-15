package com.visionmapping.service.support;

import com.visionmapping.exception.BusinessRuleException;
import com.visionmapping.repository.UserScopedRepository;
import java.util.List;

/**
 * Stateless helpers every entity service shares: generating the next display
 * code, listing a user's records, guarding a permanent delete, and parsing a
 * status string into its enum. Static because they hold no state and depend
 * on nothing injectable.
 */
public final class ServiceSupport {

    private ServiceSupport() {
    }

    /** The rows every "list X" endpoint returns: the user's records, hiding archived ones unless asked. */
    public static <T> List<T> findAllForUser(UserScopedRepository<T> repository, Long userId, boolean includeArchived) {
        return includeArchived
                ? repository.findByUser_Id(userId)
                : repository.findByUser_IdAndArchivedFalse(userId);
    }

    public static String nextCode(String prefix, int currentCount) {
        return "%s-%03d".formatted(prefix, currentCount + 1);
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /** Null (not an empty string) means "no search", which the query treats as "match everything". */
    public static String likeTerm(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return "%" + search.trim().toLowerCase() + "%";
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
