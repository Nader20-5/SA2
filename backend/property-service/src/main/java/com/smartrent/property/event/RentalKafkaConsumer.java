package com.smartrent.property.event;

import com.smartrent.property.model.Property;
import com.smartrent.property.model.PropertyStatus;
import com.smartrent.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RentalKafkaConsumer {

    private final PropertyRepository propertyRepository;

    @KafkaListener(topics = "rental-application-submitted-topic", groupId = "property-service-group")
    @Transactional
    public void handleRentalApplicationSubmitted(RentalApplicationSubmittedEvent event) {
        log.info("===== KAFKA EVENT RECEIVED: RentalApplicationSubmitted =====");
        log.info("Application ID: {}", event.getApplicationId());
        log.info("Property ID: {}", event.getPropertyId());
        log.info("Tenant ID: {}", event.getTenantId());
        log.info("Landlord ID: {}", event.getLandlordId());
        log.info(">> Application received, property remains available for other dates");
        log.info("============================================================");
    }
}
