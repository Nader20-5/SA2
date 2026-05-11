package com.smartrent.rental.dto;

import com.smartrent.rental.model.EmploymentStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRentalDto {

    @NotNull
    private Long propertyId;

    private String coverLetter;

    @NotNull
    private EmploymentStatus employmentStatus;

    private BigDecimal monthlyIncome;

    @NotNull
    @Future
    private LocalDate moveInDate;

    @NotNull
    @Future
    private LocalDate leaseEndDate;
}
