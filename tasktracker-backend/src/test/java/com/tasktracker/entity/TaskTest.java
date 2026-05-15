package com.tasktracker.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TaskTest {

    @Test
    void shouldSetTimestampsOnCreate() {
        Task task = new Task();

        task.onCreate();

        assertThat(task.getCreatedAt()).isNotNull();
        assertThat(task.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldUpdateTimestampOnUpdate() throws InterruptedException {
        Task task = new Task();

        task.onCreate();
        LocalDateTime first = task.getUpdatedAt();

        Thread.sleep(5);

        task.onUpdate();

        assertThat(task.getUpdatedAt()).isAfter(first);
    }
}