package com.tasktracker.controller;

import com.tasktracker.dto.AdminStatsResponse;
import com.tasktracker.dto.AdminTaskResponse;
import com.tasktracker.dto.AdminUserResponse;
import com.tasktracker.service.AdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AdminController.class,
        excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
                type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
                classes = com.tasktracker.security.JwtFilter.class
        )
)
@Import(com.tasktracker.config.TestSecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    private AdminUserResponse buildUser(boolean active) {
        return AdminUserResponse.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .name("Alice")
                .isActive(active)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Admin should get all users")
    @WithMockUser(roles = "ADMIN")
    void shouldGetAllUsers() throws Exception {

        when(adminService.getAllUsers())
                .thenReturn(List.of(buildUser(true)));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("alice"));

        verify(adminService).getAllUsers();
    }

    @Test
    @DisplayName("Admin should get all tasks")
    @WithMockUser(roles = "ADMIN")
    void shouldGetAllTasks() throws Exception {

        when(adminService.getAllTasks())
                .thenReturn(List.of(AdminTaskResponse.builder().build()));

        mockMvc.perform(get("/api/admin/tasks"))
                .andExpect(status().isOk());

        verify(adminService).getAllTasks();
    }

    @Test
    @DisplayName("Admin should get stats")
    @WithMockUser(roles = "ADMIN")
    void shouldGetStats() throws Exception {

        when(adminService.getStats())
                .thenReturn(AdminStatsResponse.builder()
                        .totalUsers(10)
                        .totalTasks(20)
                        .doneTasks(5)
                        .inProgressTasks(3)
                        .build());

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10));

        verify(adminService).getStats();
    }

    @Test
    @DisplayName("Super admin should delete user")
    @WithMockUser(roles = "SUPER_ADMIN")
    void shouldDeleteUser() throws Exception {

        doNothing().when(adminService).deleteUser(anyLong());

        mockMvc.perform(delete("/api/admin/users/1"))
                .andExpect(status().isNoContent());

        verify(adminService).deleteUser(1L);
    }

    @Test
    @DisplayName("Admin cannot delete user")
    @WithMockUser(roles = "ADMIN")
    void shouldReturnForbiddenWhenAdminDeletesUser() throws Exception {

        mockMvc.perform(delete("/api/admin/users/1"))
                .andExpect(status().isForbidden());

        verify(adminService, never()).deleteUser(anyLong());
    }

    @Test
    @DisplayName("Super admin can access admin endpoints")
    @WithMockUser(roles = "SUPER_ADMIN")
    void shouldAllowSuperAdminAccess() throws Exception {

        when(adminService.getAllUsers())
                .thenReturn(List.of(buildUser(true)));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk());

        verify(adminService).getAllUsers();
    }
}