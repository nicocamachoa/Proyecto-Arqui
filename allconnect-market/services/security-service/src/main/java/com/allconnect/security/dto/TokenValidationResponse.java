package com.allconnect.security.dto;

import com.allconnect.security.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {

    private Boolean valid;
    private Long userId;
    private String email;
    private Role role;
    private String message;
}
