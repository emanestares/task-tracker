package com.tasktracker.dto;

import com.tasktracker.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private User.Role role;
    private LocalDateTime createdAt;
}