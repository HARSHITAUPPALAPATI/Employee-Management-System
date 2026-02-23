package com.ems.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private BigDecimal salary;
    private Long departmentId;
    private String departmentName;
    private Long designationId;
    private String designationTitle;
    private Long reportingManagerId;
    private String reportingManagerName;
    private Boolean isActive;
    private String employmentStatus;
    private LocalDate resignationDate;
    private LocalDate noticePeriodEndDate;
    private LocalDateTime createdAt;
}
