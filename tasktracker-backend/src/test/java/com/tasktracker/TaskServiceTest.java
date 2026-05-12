package com.tasktracker;

import com.tasktracker.dto.TaskRequest;
import com.tasktracker.dto.TaskResponse;
import com.tasktracker.entity.Task;
import com.tasktracker.entity.User;
import com.tasktracker.exception.TaskNotFoundException;
import com.tasktracker.repository.TaskRepository;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.service.TaskService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private TaskService taskService;

    private User mockUser;
    private Task mockTask;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).username("testuser").build();
        mockTask = Task.builder()
                .id(1L).title("Test Task").description("Desc")
                .completed(false).user(mockUser).build();
    }

    // TC_001
    @Test
    void getAllTasks_returnsListForUser() {
        when(taskRepository.findByUserId(1L)).thenReturn(List.of(mockTask));
        List<TaskResponse> result = taskService.getAllTasks(1L);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Task");
    }

    // TC_002
    @Test
    void getTaskById_validId_returnsTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        TaskResponse result = taskService.getTaskById(1L, 1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    // TC_003
    @Test
    void getTaskById_invalidId_throwsException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> taskService.getTaskById(999L, 1L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("999");
    }

    // TC_004
    @Test
    void createTask_validRequest_returnsCreatedTask() {
        TaskRequest req = new TaskRequest();
        req.setTitle("New Task");
        req.setDescription("New Desc");
        req.setCompleted(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

        TaskResponse result = taskService.createTask(req, 1L);
        assertThat(result).isNotNull();
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    // TC_006
    @Test
    void updateTask_validId_updatesAndReturns() {
        TaskRequest req = new TaskRequest();
        req.setTitle("Updated Title");
        req.setCompleted(true);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

        TaskResponse result = taskService.updateTask(1L, req, 1L);
        assertThat(result).isNotNull();
        verify(taskRepository).save(any(Task.class));
    }

    // TC_007
    @Test
    void updateTask_invalidId_throwsException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());
        TaskRequest req = new TaskRequest();
        req.setTitle("x");
        assertThatThrownBy(() -> taskService.updateTask(999L, req, 1L))
                .isInstanceOf(TaskNotFoundException.class);
    }

    // TC_008
    @Test
    void deleteTask_validId_deletesTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        taskService.deleteTask(1L, 1L);
        verify(taskRepository, times(1)).delete(mockTask);
    }

    // TC_009
    @Test
    void deleteTask_invalidId_throwsException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> taskService.deleteTask(999L, 1L))
                .isInstanceOf(TaskNotFoundException.class);
    }
}