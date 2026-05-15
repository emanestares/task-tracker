package com.tasktracker.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TaskResponseTest {

    @Test
    void builderShouldSetAllFieldsCorrectly() {

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.of(2026, 1, 10);

        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .title("Build API")
                .description("Implement task endpoints")
                .completed(true)
                .userId(5L)
                .createdAt(now)
                .updatedAt(now)
                .dueDate(dueDate)
                .priority("HIGH")
                .status("DONE")
                .build();

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Build API");
        assertThat(response.getDescription()).isEqualTo("Implement task endpoints");
        assertThat(response.getCompleted()).isTrue();
        assertThat(response.getUserId()).isEqualTo(5L);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
        assertThat(response.getDueDate()).isEqualTo(dueDate);
        assertThat(response.getPriority()).isEqualTo("HIGH");
        assertThat(response.getStatus()).isEqualTo("DONE");
    }

    @Test
    void settersAndGettersShouldWorkCorrectly() {

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.of(2026, 6, 15);

        TaskResponse response = TaskResponse.builder().build();

        response.setId(10L);
        response.setTitle("Task");
        response.setDescription("Desc");
        response.setCompleted(false);
        response.setUserId(2L);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);
        response.setDueDate(dueDate);
        response.setPriority("LOW");
        response.setStatus("TODO");

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Task");
        assertThat(response.getDescription()).isEqualTo("Desc");
        assertThat(response.getCompleted()).isFalse();
        assertThat(response.getUserId()).isEqualTo(2L);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
        assertThat(response.getDueDate()).isEqualTo(dueDate);
        assertThat(response.getPriority()).isEqualTo("LOW");
        assertThat(response.getStatus()).isEqualTo("TODO");
    }

    @Test
    void equalsHashCodeAndToStringShouldWork() {

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.of(2026, 1, 10);

        TaskResponse r1 = TaskResponse.builder()
                .id(1L)
                .title("Task")
                .description("Desc")
                .completed(true)
                .userId(1L)
                .createdAt(now)
                .updatedAt(now)
                .dueDate(dueDate)
                .priority("MEDIUM")
                .status("IN_PROGRESS")
                .build();

        TaskResponse r2 = TaskResponse.builder()
                .id(1L)
                .title("Task")
                .description("Desc")
                .completed(true)
                .userId(1L)
                .createdAt(now)
                .updatedAt(now)
                .dueDate(dueDate)
                .priority("MEDIUM")
                .status("IN_PROGRESS")
                .build();

        assertThat(r1)
                .isEqualTo(r2)
                .hasSameHashCodeAs(r2);

        assertThat(r1.toString())
                .contains("title=Task")
                .contains("status=IN_PROGRESS")
                .contains("priority=MEDIUM");
    }
}