package com.smartrent.rental.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RentalKafkaProducer {

    private static final String TOPIC = "rental-application-submitted-topic";

    private final KafkaTemplate<String, RentalApplicationSubmittedEvent> kafkaTemplate;

    public void publishRentalApplicationSubmitted(RentalApplicationSubmittedEvent event) {
        log.info("Publishing RentalApplicationSubmittedEvent to topic '{}': applicationId={}, propertyId={}",
                TOPIC, event.getApplicationId(), event.getPropertyId());
        kafkaTemplate.send(TOPIC, String.valueOf(event.getApplicationId()), event);
    }
}
