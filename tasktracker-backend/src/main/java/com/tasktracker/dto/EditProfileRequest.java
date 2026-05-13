package com.tasktracker.dto;

import lombok.Data;

@Data
public class EditProfileRequest {
    private String name;
    private String username;
    private String email;
    private String currentPassword;
    private String password;
}