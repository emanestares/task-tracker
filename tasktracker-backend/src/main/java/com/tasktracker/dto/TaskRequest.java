package com.tasktracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Boolean completed = false;

    // Optional — ISO date string: "2025-12-31"
    private LocalDate dueDate;

    // Optional — e.g. "LOW", "MEDIUM", "HIGH"
    @Size(max = 50, message = "Priority cannot exceed 50 characters")
    private String priority;

    // Optional — e.g. "TODO", "IN_PROGRESS", "DONE", "CANCELLED"
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;
}