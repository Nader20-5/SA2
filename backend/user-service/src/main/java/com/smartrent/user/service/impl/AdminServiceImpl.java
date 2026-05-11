package com.smartrent.user.service.impl;

import com.smartrent.user.annotation.Auditable;
import com.smartrent.user.dto.AdminStatsDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.dto.UserStatusUpdateDto;
import com.smartrent.user.exception.IllegalOperationException;
import com.smartrent.user.exception.UserNotFoundException;
import com.smartrent.user.mapper.UserMapper;
import com.smartrent.user.model.Role;
import com.smartrent.user.model.User;
import com.smartrent.user.model.UserStatus;
import com.smartrent.user.repository.UserRepository;
import com.smartrent.user.service.interfaces.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public Page<UserResponseDto> getAllUsers(Role role, UserStatus status, Pageable pageable) {
        Page<User> userPage;
        if (role != null && status != null) {
            userPage = userRepository.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else if (status != null) {
            userPage = userRepository.findByStatus(status, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        return userPage.map(userMapper::toResponseDto);
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_USER_STATUS", resourceType = "USER")
    public UserResponseDto updateUserStatus(Long userId, UserStatusUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Guard: Cannot deactivate ADMIN
        if (user.getRole() == Role.ADMIN && dto.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalOperationException("Cannot deactivate an ADMIN account");
        }

        user.setStatus(dto.getStatus());
        user = userRepository.save(user);

        return userMapper.toResponseDto(user);
    }

    @Override
    public AdminStatsDto getPlatformStats() {
        return AdminStatsDto.builder()
                .totalUsers(userRepository.count())
                .totalTenants(userRepository.countByRole(Role.TENANT))
                .totalLandlords(userRepository.countByRole(Role.LANDLORD))
                .activeLandlords(userRepository.countByRoleAndStatus(Role.LANDLORD, UserStatus.ACTIVE))
                .pendingLandlords(userRepository.countByRoleAndStatus(Role.LANDLORD, UserStatus.PENDING))
                .build();
    }
}
