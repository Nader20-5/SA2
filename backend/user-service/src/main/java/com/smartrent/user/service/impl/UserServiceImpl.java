package com.smartrent.user.service.impl;

import com.smartrent.user.annotation.Auditable;
import com.smartrent.user.dto.UpdateProfileDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.exception.UserNotFoundException;
import com.smartrent.user.mapper.UserMapper;
import com.smartrent.user.model.User;
import com.smartrent.user.repository.UserRepository;
import com.smartrent.user.service.interfaces.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponseDto getOwnProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return userMapper.toResponseDto(user);
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_PROFILE", resourceType = "USER")
    public UserResponseDto updateOwnProfile(Long userId, UpdateProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Patch fields — skip nulls
        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(dto.getProfilePictureUrl());
        }

        user = userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    /**
     * Internal endpoint called by Feign from other services.
     * Must never throw 500 — other services depend on this.
     */
    @Override
    public UserResponseDto getUserInternal(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return userMapper.toResponseDto(user);
    }
}
