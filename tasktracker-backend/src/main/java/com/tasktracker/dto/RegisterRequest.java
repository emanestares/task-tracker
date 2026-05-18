package com.tasktracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @Pattern(
            regexp = "^[a-zA-Z0-9_-]+$",
            message = "Username must not contain spaces or special characters"
    )
    @NotBlank
    @Size(min = 3, max = 50, message = "Username must be between 3-50 characters")
    private String username;

    @NotBlank
    @Size(min = 2, max = 100, message = "Name must be between 2-100 characters")
    private String name;

    @NotBlank
    @Email
    @Size(min = 2, max = 100, message = "Email must be between 3-100 characters")
    private String email;

    @NotBlank
    @Size(min = 6, max = 100, message = "Password must be between 6-100 characters")
    private String password;

}