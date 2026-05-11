package com.smartrent.user.controller;

import com.smartrent.user.dto.AdminStatsDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.dto.UserStatusUpdateDto;
import com.smartrent.user.model.Role;
import com.smartrent.user.model.UserStatus;
import com.smartrent.user.service.interfaces.IAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponseDto>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(role, status, pageable));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDto dto) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, dto));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }
}
