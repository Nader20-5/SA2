package com.smartrent.rental.client;

import com.smartrent.rental.client.dto.UserResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USER-SERVICE", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}/internal")
    UserResponseDto getUserById(@PathVariable Long id);
}
