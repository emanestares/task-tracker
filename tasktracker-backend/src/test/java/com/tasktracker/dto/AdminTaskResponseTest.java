package com.tasktracker.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AdminTaskResponseTest {

    @Test
    void builderShouldSetAllFieldsCorrectly() {

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.of(2026, 1, 15);

        AdminUserResponse user = AdminUserResponse.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .name("Alice")
                .isActive(true)
                .build();

        AdminTaskResponse response = AdminTaskResponse.builder()
                .id(100L)
                .title("Complete project")
                .description("Finish the backend module")
                .completed(true)
                .user(user)
                .userId(1L)
                .createdAt(now)
                .updatedAt(now)
                .dueDate(dueDate)
                .priority("HIGH")
                .status("DONE")
                .build();

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Complete project");
        assertThat(response.getDescription()).isEqualTo("Finish the backend module");
        assertThat(response.getCompleted()).isTrue();
        assertThat(response.getUser()).isEqualTo(user);
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
        assertThat(response.getDueDate()).isEqualTo(dueDate);
        assertThat(response.getPriority()).isEqualTo("HIGH");
        assertThat(response.getStatus()).isEqualTo("DONE");
    }

    @Test
    void settersAndGettersShouldWorkCorrectly() {

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.of(2026, 5, 20);

        AdminTaskResponse response = AdminTaskResponse.builder().build();

        response.setId(10L);
        response.setTitle("Test task");
        response.setDescription("Test description");
        response.setCompleted(false);
        response.setUserId(5L);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);
        response.setDueDate(dueDate);
        response.setPriority("LOW");
        response.setStatus("TODO");

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Test task");
        assertThat(response.getDescription()).isEqualTo("Test description");
        assertThat(response.getCompleted()).isFalse();
        assertThat(response.getUserId()).isEqualTo(5L);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
        assertThat(response.getDueDate()).isEqualTo(dueDate);
        assertThat(response.getPriority()).isEqualTo("LOW");
        assertThat(response.getStatus()).isEqualTo("TODO");
    }

    @Test
    void equalsHashCodeAndToStringShouldWork() {

        AdminTaskResponse response1 = AdminTaskResponse.builder()
                .id(1L)
                .title("Task")
                .description("Description")
                .completed(true)
                .userId(2L)
                .priority("MEDIUM")
                .status("IN_PROGRESS")
                .build();

        AdminTaskResponse response2 = AdminTaskResponse.builder()
                .id(1L)
                .title("Task")
                .description("Description")
                .completed(true)
                .userId(2L)
                .priority("MEDIUM")
                .status("IN_PROGRESS")
                .build();

        assertThat(response1)
                .isEqualTo(response2)
                .hasSameHashCodeAs(response2);

        assertThat(response1.toString())
                .contains("title=Task")
                .contains("description=Description")
                .contains("priority=MEDIUM")
                .contains("status=IN_PROGRESS");
    }
}