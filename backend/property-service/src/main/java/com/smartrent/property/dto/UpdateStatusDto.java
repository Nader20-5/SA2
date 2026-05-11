package com.smartrent.property.dto;

import com.smartrent.property.model.PropertyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusDto {

    @NotNull
    private PropertyStatus status;

    private String rejectionReason;
}
