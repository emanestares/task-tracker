package com.tasktracker.service;

import com.tasktracker.dto.AdminStatsResponse;
import com.tasktracker.dto.AdminTaskResponse;
import com.tasktracker.dto.AdminUserResponse;
import com.tasktracker.entity.Task;
import com.tasktracker.entity.User;
import com.tasktracker.exception.UserNotFoundException;
import com.tasktracker.repository.TaskRepository;
import com.tasktracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapUserToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminTaskResponse> getAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapTaskToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        List<Task> tasks = taskRepository.findAll();

        long doneTasks = tasks.stream()
                .filter(task -> isStatus(task.getStatus(), "DONE") || Boolean.TRUE.equals(task.getCompleted()))
                .count();

        long inProgressTasks = tasks.stream()
                .filter(task -> isStatus(task.getStatus(), "IN_PROGRESS"))
                .count();

        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalTasks(taskRepository.count())
                .doneTasks(doneTasks)
                .inProgressTasks(inProgressTasks)
                .build();
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    private AdminUserResponse mapUserToResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getFullName() != null && !user.getFullName().isBlank()
                        ? user.getFullName()
                        : user.getUsername())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminTaskResponse mapTaskToResponse(Task task) {
        return AdminTaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .completed(task.getCompleted())
                .userId(task.getUser() != null ? task.getUser().getId() : null)
                .user(task.getUser() != null ? mapUserToResponse(task.getUser()) : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .dueDate(task.getDueDate())
                .priority(task.getPriority())
                .status(task.getStatus())
                .build();
    }

    private boolean isStatus(String actual, String expected) {
        return actual != null && actual.equalsIgnoreCase(expected);
    }
}