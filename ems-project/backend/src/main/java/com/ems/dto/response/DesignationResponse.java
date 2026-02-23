package com.ems.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignationResponse {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
}
