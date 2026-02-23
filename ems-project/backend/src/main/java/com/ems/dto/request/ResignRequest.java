package com.ems.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResignRequest {
    @NotNull(message = "Last working day is required")
    private LocalDate lastWorkingDay;
}
