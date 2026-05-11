package com.smartrent.visit.client;

import com.smartrent.visit.client.dto.PropertySummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROPERTY-SERVICE", path = "/api/properties")
public interface PropertyServiceClient {

    @GetMapping("/{id}/internal")
    PropertySummaryDto getPropertyById(@PathVariable Long id);

    @GetMapping("/{id}")
    java.util.Map<String, Object> getPropertyDetails(@PathVariable Long id);
}
