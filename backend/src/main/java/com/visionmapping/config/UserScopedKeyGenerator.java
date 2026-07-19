package com.visionmapping.config;

import com.visionmapping.service.support.UserCacheEvictor;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

/**
 * The application's only cache key generator (BR-20): every key embeds the
 * authenticated user's id plus that user's current eviction generation, so
 * entries can never be shared across users and a generation bump orphans them
 * all at once. Caching on a path with no authenticated user is a programming
 * error and fails loudly rather than risking a cross-user key.
 */
@Component
@RequiredArgsConstructor
public class UserScopedKeyGenerator implements KeyGenerator {

    private final UserCacheEvictor evictor;

    @Override
    public Object generate(Object target, Method method, Object... params) {
        Long userId = UserCacheEvictor.currentUserIdOrNull();
        if (userId == null) {
            throw new IllegalStateException(
                    "Cannot build a cache key without an authenticated user: " + method);
        }
        String args = Arrays.stream(params)
                .map(Objects::toString)
                .collect(Collectors.joining(","));
        return "u%d:g%d:%s(%s)".formatted(userId, evictor.generation(userId), method.getName(), args);
    }
}
