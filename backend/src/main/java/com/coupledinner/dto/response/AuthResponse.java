package com.coupledinner.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private UserResponse user;
    private UserResponse partner;
    private String inviteCode;
    private boolean coupleComplete;
}
