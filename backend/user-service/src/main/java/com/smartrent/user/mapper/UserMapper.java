package com.smartrent.user.mapper;

import com.smartrent.user.dto.RegisterDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toResponseDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(RegisterDto dto);

    List<UserResponseDto> toResponseDtoList(List<User> users);
}
