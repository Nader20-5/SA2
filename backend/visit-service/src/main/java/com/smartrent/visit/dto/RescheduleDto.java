package com.smartrent.visit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleDto {

    @NotNull
    private LocalDate suggestedDate;

    @NotNull
    private LocalTime suggestedTime;

    private String notes;
}
