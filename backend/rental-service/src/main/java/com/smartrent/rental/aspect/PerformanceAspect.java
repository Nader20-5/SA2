package com.smartrent.rental.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class PerformanceAspect {

    private static final long THRESHOLD_MS = 500;

    @Around("execution(* com.smartrent.rental.service.impl.*.*(..))")
    public Object monitorPerformance(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;

        String methodName = pjp.getSignature().toShortString();

        if (elapsed > THRESHOLD_MS) {
            log.warn("SLOW METHOD: {} took {}ms (threshold: {}ms)", methodName, elapsed, THRESHOLD_MS);
        } else {
            log.debug("{} completed in {}ms", methodName, elapsed);
        }

        return result;
    }
}
