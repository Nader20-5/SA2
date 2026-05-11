package com.smartrent.rental.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalApplicationSubmittedEvent {

    private Long applicationId;
    private Long propertyId;
    private Long tenantId;
    private Long landlordId;
    private String status;
}
