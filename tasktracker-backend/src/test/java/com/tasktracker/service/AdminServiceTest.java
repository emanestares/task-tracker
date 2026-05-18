package com.tasktracker.service;

import com.tasktracker.dto.AdminStatsResponse;
import com.tasktracker.dto.AdminTaskResponse;
import com.tasktracker.dto.AdminUserResponse;
import com.tasktracker.entity.Task;
import com.tasktracker.entity.User;
import com.tasktracker.exception.UserNotFoundException;
import com.tasktracker.repository.TaskRepository;
import com.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TaskRepository taskRepository;

    @InjectMocks private AdminService adminService;

    private User adminUser;
    private User superAdminUser;
    private User targetUser;
    private Task task;

    @BeforeEach
    void setUp() {

        adminUser = User.builder()
                .id(1L)
                .username("admin")
                .role(User.Role.ADMIN)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        superAdminUser = User.builder()
                .id(99L)
                .username("superadmin")
                .role(User.Role.SUPER_ADMIN)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        targetUser = User.builder()
                .id(2L)
                .username("other")
                .role(User.Role.USER)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        task = Task.builder()
                .id(1L)
                .title("Task 1")
                .status("DONE")
                .completed(true)
                .user(targetUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .dueDate(LocalDate.now())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authAs(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getUsername(), "password")
        );

        when(userRepository.findByUsername(user.getUsername()))
                .thenReturn(Optional.of(user));
    }

    // ---------------- USERS ----------------

    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(targetUser));

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("other");
    }

    // ---------------- DELETE ----------------

    @Test
    void shouldDeleteUserWhenExists() {
        authAs(superAdminUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));

        adminService.deleteUser(2L);

        verify(userRepository).delete(targetUser);
    }

    @Test
    void shouldThrowWhenUserNotFoundOnDelete() {
        authAs(superAdminUser);

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.deleteUser(1L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    // ---------------- DEACTIVATE ----------------

    @Test
    void shouldDeactivateUserWhenNotSelf() {
        authAs(adminUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        var result = adminService.deactivateUser(2L);

        assertThat(result.getIsActive()).isFalse();
        verify(userRepository).save(targetUser);
    }

    @Test
    void shouldThrowWhenAdminDeactivatesSelf() {
        authAs(adminUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(
                User.builder()
                        .id(2L)
                        .username("admin")
                        .role(User.Role.ADMIN)
                        .isActive(true)
                        .build()
        ));

        assertThatThrownBy(() -> adminService.deactivateUser(2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("own account");
    }

    // ---------------- ACTIVATE ----------------

    @Test
    void shouldActivateUser() {
        authAs(superAdminUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        var result = adminService.activateUser(2L);

        assertThat(result.getIsActive()).isTrue();
        verify(userRepository).save(targetUser);
    }

    // ---------------- TASKS ----------------

    @Test
    void shouldReturnAllTasks() {
        when(taskRepository.findAll(any(Sort.class))).thenReturn(List.of(task));

        List<AdminTaskResponse> result = adminService.getAllTasks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Task 1");
    }

    // ---------------- STATS ----------------

    @Test
    void shouldReturnStats() {
        Task inProgress = Task.builder()
                .status("IN_PROGRESS")
                .completed(false)
                .build();

        when(taskRepository.findAll()).thenReturn(List.of(task, inProgress));
        when(userRepository.count()).thenReturn(5L);
        when(taskRepository.count()).thenReturn(10L);

        AdminStatsResponse stats = adminService.getStats();

        assertThat(stats.getTotalUsers()).isEqualTo(5L);
        assertThat(stats.getDoneTasks()).isEqualTo(1L);
        assertThat(stats.getInProgressTasks()).isEqualTo(1L);
    }
}