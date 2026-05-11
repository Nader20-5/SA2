package com.smartrent.user.service.interfaces;

import com.smartrent.user.dto.AdminStatsDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.dto.UserStatusUpdateDto;
import com.smartrent.user.model.Role;
import com.smartrent.user.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IAdminService {
    Page<UserResponseDto> getAllUsers(Role role, UserStatus status, Pageable pageable);
    UserResponseDto updateUserStatus(Long userId, UserStatusUpdateDto dto);
    AdminStatsDto getPlatformStats();
}
