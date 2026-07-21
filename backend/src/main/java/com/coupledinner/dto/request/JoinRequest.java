package com.coupledinner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class JoinRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Invite code is required")
    @Size(min = 8, max = 8, message = "Invite code must be 8 characters")
    private String inviteCode;
}
