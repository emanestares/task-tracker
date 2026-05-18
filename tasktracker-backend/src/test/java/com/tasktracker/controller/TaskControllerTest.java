package com.tasktracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tasktracker.config.TestSecurityConfig;
import com.tasktracker.dto.TaskRequest;
import com.tasktracker.dto.TaskResponse;
import com.tasktracker.entity.User;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtFilter;
import com.tasktracker.service.TaskService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TaskController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtFilter.class
        )
)
@Import(TestSecurityConfig.class)
class TaskControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private TaskService taskService;
    @MockBean private UserRepository userRepository;

    @BeforeEach
    void setup() {
        objectMapper.registerModule(new JavaTimeModule());

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(
                        User.builder()
                                .id(1L)
                                .username("testuser")
                                .build()
                ));
    }

    @Test
    @WithMockUser(username = "testuser")
    void GET_allTasks_returns200() throws Exception {

        when(taskService.getAllTasks(anyLong())).thenReturn(List.of());

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk());

        verify(taskService).getAllTasks(1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void POST_createTask_validData_returns201() throws Exception {

        TaskRequest req = new TaskRequest();
        req.setTitle("Buy groceries");
        req.setDescription("Milk and eggs");
        req.setCompleted(false);
        req.setStatus("TODO");
        req.setPriority("MEDIUM");
        req.setDueDate(LocalDate.now().plusDays(1));

        TaskResponse resp = TaskResponse.builder()
                .id(1L)
                .title("Buy groceries")
                .completed(false)
                .status("TODO")
                .priority("MEDIUM")
                .dueDate(LocalDate.now().plusDays(1))
                .build();

        when(taskService.createTask(any(), anyLong())).thenReturn(resp);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Buy groceries"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));

        verify(taskService).createTask(any(), eq(1L));
    }

    @Test
    @WithMockUser(username = "testuser")
    void POST_createTask_missingTitle_returns400() throws Exception {

        TaskRequest req = new TaskRequest();
        req.setDescription("No title here");

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).createTask(any(), anyLong());
    }

    @Test
    @WithMockUser(username = "testuser")
    void DELETE_validId_returns204() throws Exception {

        doNothing().when(taskService).deleteTask(anyLong(), anyLong());

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(1L, 1L);
    }
}