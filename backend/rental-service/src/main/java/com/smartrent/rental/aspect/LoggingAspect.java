package com.smartrent.rental.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.smartrent.rental.controller.*.*(..))")
    public Object logControllerMethod(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().toShortString();
        String args = Arrays.toString(pjp.getArgs());

        log.info("→ {} called with args: {}", methodName, args);

        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("← {} completed successfully in {}ms", methodName, elapsed);
            return result;
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("✗ {} failed after {}ms — {}: {}", methodName, elapsed,
                    e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
    }
}
