package com.smartrent.visit.controller;

import com.smartrent.visit.dto.*;
import com.smartrent.visit.service.interfaces.IVisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final IVisitService visitService;

    @PostMapping
    public ResponseEntity<VisitResponseDto> createVisit(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateVisitDto dto) {
        return ResponseEntity.ok(visitService.createVisit(userId, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<VisitResponseDto>> getTenantVisits(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(visitService.getTenantVisits(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelVisit(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        visitService.cancelVisit(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/landlord")
    public ResponseEntity<List<VisitResponseDto>> getLandlordVisits(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(visitService.getLandlordVisits(userId));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<VisitResponseDto> approveVisit(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(visitService.approveVisit(userId, id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<VisitResponseDto> rejectVisit(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody RejectVisitDto dto) {
        return ResponseEntity.ok(visitService.rejectVisit(userId, id, dto));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<VisitResponseDto> rescheduleVisit(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleDto dto) {
        return ResponseEntity.ok(visitService.rescheduleVisit(userId, id, dto));
    }
}
