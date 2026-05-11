package com.smartrent.visit.client;

import com.smartrent.visit.client.dto.UserResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USER-SERVICE", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}/internal")
    UserResponseDto getUserById(@PathVariable Long id);
}
