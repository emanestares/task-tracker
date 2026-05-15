package com.tasktracker.repository;

import com.tasktracker.entity.Task;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskRepositoryTest {

    @Mock private TaskRepository taskRepository;

    @Test
    void shouldAllowFindByUserId() {
        when(taskRepository.findByUserId(1L)).thenReturn(List.of(new Task()));

        List<Task> tasks = taskRepository.findByUserId(1L);

        assertThat(tasks).hasSize(1);
    }

    @Test
    void shouldAllowFindByUserIdAndCompleted() {
        when(taskRepository.findByUserIdAndCompleted(1L, true)).thenReturn(List.of(new Task()));

        List<Task> tasks = taskRepository.findByUserIdAndCompleted(1L, true);

        assertThat(tasks).hasSize(1);
    }

    @Test
    void shouldAllowFindByUserIdAndPriority() {
        when(taskRepository.findByUserIdAndPriority(1L, "HIGH")).thenReturn(List.of(new Task()));

        List<Task> tasks = taskRepository.findByUserIdAndPriority(1L, "HIGH");

        assertThat(tasks).hasSize(1);
    }
}
