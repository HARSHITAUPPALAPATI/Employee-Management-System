package com.ems.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String message;
    private String createdBy;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
