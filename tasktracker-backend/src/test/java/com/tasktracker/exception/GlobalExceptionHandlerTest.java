package com.tasktracker.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @Mock private MethodArgumentNotValidException validationException;
    @Mock private BindingResult bindingResult;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleNotFound_shouldReturn404() {
        TaskNotFoundException ex = new TaskNotFoundException("Task missing");

        var response = handler.handleNotFound(ex);

        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        assertThat(response.getBody()).containsEntry("message", "Task missing");
    }

    @Test
    void handleUserNotFound_shouldReturn404() {
        UserNotFoundException ex = new UserNotFoundException("User missing");

        var response = handler.handleUserNotFound(ex);

        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        assertThat(response.getBody()).containsEntry("message", "User missing");
    }

    @Test
    void handleIllegalArgument_shouldReturn400() {
        IllegalArgumentException ex = new IllegalArgumentException("Bad request");

        var response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        assertThat(response.getBody()).containsEntry("message", "Bad request");
    }

    @Test
    void handleFieldValidation_shouldReturn400WithFields() {
        FieldValidationException ex = new FieldValidationException(Map.of("username", "Required"));

        var response = handler.handleFieldValidation(ex);

        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        assertThat(response.getBody()).containsEntry("fields", Map.of("username", "Required"));
    }



    
}
