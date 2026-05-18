package com.tasktracker.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class LoginRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private LoginRequest validRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsername("john");
        request.setPassword("password123");
        return request;
    }

    @Test
    void shouldPassValidation_whenValid() {
        LoginRequest request = validRequest();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldFail_whenUsernameIsBlank() {
        LoginRequest request = validRequest();
        request.setUsername("");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenPasswordIsBlank() {
        LoginRequest request = validRequest();
        request.setPassword("");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("password")
        );
    }

    @Test
    void shouldFail_whenUsernameIsNull() {
        LoginRequest request = validRequest();
        request.setUsername(null);

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenPasswordIsNull() {
        LoginRequest request = validRequest();
        request.setPassword(null);

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("password")
        );
    }
}