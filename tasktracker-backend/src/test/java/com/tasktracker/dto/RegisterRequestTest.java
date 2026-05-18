package com.tasktracker.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RegisterRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private RegisterRequest validRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("john_doe");
        req.setName("John Doe");
        req.setEmail("john@example.com");
        req.setPassword("password123");
        return req;
    }

    @Test
    void shouldPassValidation_whenValid() {
        RegisterRequest request = validRequest();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldFail_whenUsernameIsBlank() {
        RegisterRequest request = validRequest();
        request.setUsername("");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenUsernameHasInvalidCharacters() {
        RegisterRequest request = validRequest();
        request.setUsername("john doe!"); // invalid space + symbol

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenUsernameTooShort() {
        RegisterRequest request = validRequest();
        request.setUsername("ab");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenNameIsBlank() {
        RegisterRequest request = validRequest();
        request.setName("");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("name")
        );
    }

    @Test
    void shouldFail_whenEmailInvalid() {
        RegisterRequest request = validRequest();
        request.setEmail("invalid-email");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("email")
        );
    }

    @Test
    void shouldFail_whenPasswordTooShort() {
        RegisterRequest request = validRequest();
        request.setPassword("12345"); // < 6 chars

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("password")
        );
    }

    @Test
    void shouldFail_whenAllFieldsEmpty() {
        RegisterRequest request = new RegisterRequest();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertThat(violations).hasSizeGreaterThan(0);
    }
}