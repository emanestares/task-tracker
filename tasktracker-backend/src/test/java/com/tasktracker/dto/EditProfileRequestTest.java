package com.tasktracker.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class EditProfileRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private EditProfileRequest validRequest() {
        EditProfileRequest req = new EditProfileRequest();
        req.setUsername("john_doe");
        req.setName("John Doe");
        req.setEmail("john@example.com");
        req.setPassword("password123");
        req.setCurrentPassword("oldpass123");
        return req;
    }

    @Test
    void shouldPassValidation_whenValid() {
        EditProfileRequest request = validRequest();

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldFail_whenUsernameIsBlank() {
        EditProfileRequest request = validRequest();
        request.setUsername("");

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenUsernameHasInvalidCharacters() {
        EditProfileRequest request = validRequest();
        request.setUsername("john doe!"); // invalid spaces + special char

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("username")
        );
    }

    @Test
    void shouldFail_whenEmailIsInvalid() {
        EditProfileRequest request = validRequest();
        request.setEmail("invalid-email");

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("email")
        );
    }

    @Test
    void shouldFail_whenNameTooShort() {
        EditProfileRequest request = validRequest();
        request.setName("A");

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("name")
        );
    }

    @Test
    void shouldFail_whenPasswordTooShort() {
        EditProfileRequest request = validRequest();
        request.setPassword("123"); // < 6 chars

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("password")
        );
    }

    @Test
    void shouldFail_whenCurrentPasswordTooShort() {
        EditProfileRequest request = validRequest();
        request.setCurrentPassword("123"); // < 6 chars

        Set<ConstraintViolation<EditProfileRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v ->
                v.getPropertyPath().toString().equals("currentPassword")
        );
    }
}