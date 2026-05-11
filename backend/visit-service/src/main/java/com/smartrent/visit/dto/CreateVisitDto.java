package com.smartrent.visit.dto;

import jakarta.validation.constraints.Future;
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
public class CreateVisitDto {

    @NotNull
    private Long propertyId;

    @NotNull
    @Future
    private LocalDate requestedDate;

    @NotNull
    private LocalTime requestedTime;

    private String notes;
}
