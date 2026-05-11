package com.smartrent.user.aspect;

import com.smartrent.user.annotation.Auditable;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
public class AuditAspect {

    @AfterReturning("@annotation(com.smartrent.user.annotation.Auditable)")
    public void auditAction(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        String action = auditable.action();
        String resourceType = auditable.resourceType();
        
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String userId = request.getHeader("X-User-Id");
            String userEmail = request.getHeader("X-User-Email");

            log.info("AUDIT LOG - [Action: {}] [Resource: {}] [User ID: {}] [User Email: {}] [Method: {}]", 
                    action, resourceType, userId, userEmail, method.getName());
        } else {
            log.info("AUDIT LOG - [Action: {}] [Resource: {}] [Method: {}] (No HTTP Request Context)", 
                    action, resourceType, method.getName());
        }
    }
}
