package com.smartrent.visit.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequestedEvent {

    private Long visitId;
    private Long propertyId;
    private String propertyTitle;
    private Long tenantId;
    private Long landlordId;
    private LocalDate requestedDate;
    private LocalTime requestedTime;
}
