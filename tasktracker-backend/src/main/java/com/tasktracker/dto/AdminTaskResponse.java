package com.tasktracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminTaskResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private AdminUserResponse user;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate dueDate;
    private String priority;
    private String status;
}