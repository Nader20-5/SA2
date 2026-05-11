package com.smartrent.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileDto {
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePictureUrl;
}
