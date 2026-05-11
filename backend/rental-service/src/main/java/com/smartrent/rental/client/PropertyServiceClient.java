package com.smartrent.rental.client;

import com.smartrent.rental.client.dto.PropertySummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROPERTY-SERVICE", path = "/api/properties")
public interface PropertyServiceClient {

    @GetMapping("/{id}/internal")
    PropertySummaryDto getPropertyById(@PathVariable Long id);
}
