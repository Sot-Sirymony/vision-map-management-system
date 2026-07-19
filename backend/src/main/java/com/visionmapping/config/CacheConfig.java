package com.visionmapping.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visionmapping.dto.response.DashboardSummaryResponse;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cache.interceptor.LoggingCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

/**
 * FR-30 cache layer. The backend (`spring.cache.type`) is chosen per profile:
 * `redis` when a CACHE_TYPE env var enables it, `simple` for tests, and `none`
 * by default so the application behaves exactly as before when no Redis is
 * configured. Values are the response DTOs serialized as plain JSON (BR-23) —
 * each cache names its value type, so no class metadata is stored.
 */
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class CacheConfig implements CachingConfigurer {

    public static final String DASHBOARD_CACHE = "dashboard";

    /** Backstop for missed evictions; explicit eviction is the primary freshness mechanism. */
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final String KEY_PREFIX = "vms::";

    private final UserScopedKeyGenerator userScopedKeyGenerator;

    /** Every @Cacheable in the application gets user-scoped keys (BR-20). */
    @Override
    public KeyGenerator keyGenerator() {
        return userScopedKeyGenerator;
    }

    /** Cache failures degrade to a miss, never to a failed request (BR-21). */
    @Override
    public CacheErrorHandler errorHandler() {
        return new LoggingCacheErrorHandler();
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheCustomizer(ObjectMapper objectMapper) {
        return builder -> builder.withCacheConfiguration(
                DASHBOARD_CACHE, dtoCache(objectMapper, DashboardSummaryResponse.class));
    }

    private static RedisCacheConfiguration dtoCache(ObjectMapper objectMapper, Class<?> valueType) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(CACHE_TTL)
                .prefixCacheNameWith(KEY_PREFIX)
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new Jackson2JsonRedisSerializer<>(objectMapper, valueType)));
    }
}
