package com.smartrent.user.controller;

import com.smartrent.user.dto.UpdateProfileDto;
import com.smartrent.user.dto.UserResponseDto;
import com.smartrent.user.service.impl.FileStorageService;
import com.smartrent.user.service.interfaces.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final FileStorageService fileStorageService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getOwnProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.getOwnProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateOwnProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileDto dto) {
        return ResponseEntity.ok(userService.updateOwnProfile(userId, dto));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        String storedPath = fileStorageService.storeFile(file);
        // Save path to user profile
        UpdateProfileDto dto = UpdateProfileDto.builder()
                .profilePictureUrl("/" + storedPath)
                .build();
        userService.updateOwnProfile(userId, dto);
        return ResponseEntity.ok(Map.of("url", "/" + storedPath));
    }

    /**
     * Internal endpoint — called by Feign from other microservices.
     * No JWT required; this is service-to-service communication.
     */
    @GetMapping("/{id}/internal")
    public ResponseEntity<UserResponseDto> getUserInternal(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserInternal(id));
    }
}
