package com.ems.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Boolean isActive;
    private Boolean accountLocked;
    private Set<String> roles;
    private LocalDateTime createdAt;
}
