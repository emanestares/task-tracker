package com.tasktracker.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalTasks;
    private long doneTasks;
    private long inProgressTasks;
}