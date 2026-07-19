package com.visionmapping.config;

import com.visionmapping.service.support.UserCacheEvictor;
import java.lang.reflect.Method;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Enforces BR-22 structurally: every mutating service entry point evicts the
 * current user's cache namespace, including write methods added in the future.
 * "Mutating" is read off the transaction demarcation the services already
 * declare — an effective @Transactional that is not readOnly. Read-only and
 * unauthenticated calls (register, login) are left alone.
 */
@Aspect
@Component
@RequiredArgsConstructor
public class UserCacheEvictionAspect {

    private final UserCacheEvictor evictor;

    @AfterReturning("execution(public * com.visionmapping.service.*Service.*(..))"
            + " || execution(public * com.visionmapping.excel.ExcelService.*(..))")
    public void evictAfterWrite(JoinPoint joinPoint) {
        if (!isWrite(joinPoint)) {
            return;
        }
        Long userId = UserCacheEvictor.currentUserIdOrNull();
        if (userId != null) {
            evictor.evictAll(userId);
        }
    }

    private static boolean isWrite(JoinPoint joinPoint) {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        Transactional transactional = AnnotatedElementUtils.findMergedAnnotation(method, Transactional.class);
        if (transactional == null) {
            transactional = AnnotatedElementUtils.findMergedAnnotation(
                    joinPoint.getTarget().getClass(), Transactional.class);
        }
        return transactional != null && !transactional.readOnly();
    }
}
