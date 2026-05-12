package com.tasktracker.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}