package com.smartrent.visit.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VisitKafkaProducer {

    private static final String TOPIC = "visit-requested-topic";

    private final KafkaTemplate<String, VisitRequestedEvent> kafkaTemplate;

    public void publishVisitRequested(VisitRequestedEvent event) {
        log.info("Publishing VisitRequestedEvent to topic '{}': visitId={}, propertyId={}, landlordId={}",
                TOPIC, event.getVisitId(), event.getPropertyId(), event.getLandlordId());
        kafkaTemplate.send(TOPIC, String.valueOf(event.getVisitId()), event);
    }
}
