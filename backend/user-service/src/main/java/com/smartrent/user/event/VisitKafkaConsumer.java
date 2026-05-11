package com.smartrent.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VisitKafkaConsumer {

    @KafkaListener(topics = "visit-requested-topic", groupId = "user-service-group")
    public void handleVisitRequested(VisitRequestedEvent event) {
        log.info("===== KAFKA EVENT RECEIVED: VisitRequested =====");
        log.info("Visit ID: {}", event.getVisitId());
        log.info("Property: {} (ID: {})", event.getPropertyTitle(), event.getPropertyId());
        log.info("Tenant ID: {}", event.getTenantId());
        log.info("Landlord ID: {}", event.getLandlordId());
        log.info("Requested Date: {} at {}", event.getRequestedDate(), event.getRequestedTime());
        log.info(">> Notification triggered: Landlord {} has a new visit request for property '{}'",
                event.getLandlordId(), event.getPropertyTitle());
        log.info("=================================================");
    }
}
