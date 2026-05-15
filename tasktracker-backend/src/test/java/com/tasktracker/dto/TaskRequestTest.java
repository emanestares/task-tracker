package com.tasktracker.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TaskRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private TaskRequest validRequest() {
        TaskRequest req = new TaskRequest();
        req.setTitle("Implement feature");
        req.setDescription("Add new task feature to system");
        req.setCompleted(false);
        req.setDueDate(LocalDate.now().plusDays(1));
        req.setPriority("HIGH");
        req.setStatus("TODO");
        return req;
    }

    @Test
    void shouldPassValidation_whenValid() {
        TaskRequest request = validRequest();

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldFail_whenTitleIsBlank() {
        TaskRequest request = validRequest();
        request.setTitle("");

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("title")
        );
    }

    @Test
    void shouldFail_whenTitleTooLong() {
        TaskRequest request = validRequest();
        request.setTitle("a".repeat(101));

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("title")
        );
    }

    @Test
    void shouldFail_whenDescriptionTooLong() {
        TaskRequest request = validRequest();
        request.setDescription("a".repeat(501));

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("description")
        );
    }

    @Test
    void shouldFail_whenDueDateIsNull() {
        TaskRequest request = validRequest();
        request.setDueDate(null);

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("dueDate")
        );
    }

    @Test
    void shouldFail_whenDueDateIsInPast() {
        TaskRequest request = validRequest();
        request.setDueDate(LocalDate.now().minusDays(1));

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("dueDate")
        );
    }

    @Test
    void shouldFail_whenPriorityTooLong() {
        TaskRequest request = validRequest();
        request.setPriority("a".repeat(51));

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("priority")
        );
    }

    @Test
    void shouldFail_whenStatusTooLong() {
        TaskRequest request = validRequest();
        request.setStatus("a".repeat(51));

        Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("status")
        );
    }

    @Test
    void shouldHaveDefaultCompletedFalse() {
        TaskRequest request = new TaskRequest();

        assertThat(request.getCompleted()).isFalse();
    }
}