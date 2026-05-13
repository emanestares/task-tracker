package com.tasktracker;

import com.tasktracker.dto.TaskRequest;
import com.tasktracker.dto.TaskResponse;
import com.tasktracker.service.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private TaskService taskService;

    // TC_001
    @Test
    @WithMockUser(username = "testuser")
    void GET_allTasks_returns200() throws Exception {
        when(taskService.getAllTasks(any())).thenReturn(List.of());
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk());
    }

    // TC_004 — all fields including new ones
    @Test
    @WithMockUser(username = "testuser")
    void POST_createTask_validData_returns201() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setTitle("Buy groceries");
        req.setDescription("Milk and eggs");
        req.setCompleted(false);
        req.setStatus("TODO");
        req.setPriority("MEDIUM");
        req.setDueDate(LocalDate.of(2025, 12, 31));

        TaskResponse resp = TaskResponse.builder()
                .id(1L)
                .title("Buy groceries")
                .completed(false)
                .status("TODO")
                .priority("MEDIUM")
                .dueDate(LocalDate.of(2025, 12, 31))
                .build();

        when(taskService.createTask(any(), any())).thenReturn(resp);

        // Register JavaTimeModule so ObjectMapper handles LocalDate
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Buy groceries"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    // TC_005 — missing title
    @Test
    @WithMockUser(username = "testuser")
    void POST_createTask_missingTitle_returns400() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setDescription("No title here");

        objectMapper.registerModule(new JavaTimeModule());

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // TC_008
    @Test
    @WithMockUser(username = "testuser")
    void DELETE_validId_returns204() throws Exception {
        doNothing().when(taskService).deleteTask(any(), any());
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }
}