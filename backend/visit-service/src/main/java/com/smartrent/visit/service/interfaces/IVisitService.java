package com.smartrent.visit.service.interfaces;

import com.smartrent.visit.dto.*;

import java.util.List;

public interface IVisitService {
    VisitResponseDto createVisit(Long tenantId, CreateVisitDto dto);
    List<VisitResponseDto> getTenantVisits(Long tenantId);
    void cancelVisit(Long tenantId, Long visitId);
    List<VisitResponseDto> getLandlordVisits(Long landlordId);
    VisitResponseDto approveVisit(Long landlordId, Long visitId);
    VisitResponseDto rejectVisit(Long landlordId, Long visitId, RejectVisitDto dto);
    VisitResponseDto rescheduleVisit(Long landlordId, Long visitId, RescheduleDto dto);
}
