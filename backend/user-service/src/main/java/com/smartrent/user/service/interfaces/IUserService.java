package com.smartrent.user.service.interfaces;

import com.smartrent.user.dto.UpdateProfileDto;
import com.smartrent.user.dto.UserResponseDto;

public interface IUserService {
    UserResponseDto getOwnProfile(Long userId);
    UserResponseDto updateOwnProfile(Long userId, UpdateProfileDto dto);
    UserResponseDto getUserInternal(Long userId);
}
