package com.tasktracker.dto;

import com.tasktracker.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AdminUserResponseTest {

    @Test
    void builderShouldSetAllFieldsCorrectly() {

        LocalDateTime now = LocalDateTime.now();

        AdminUserResponse response = AdminUserResponse.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .name("Alice")
                .role(User.Role.ADMIN)
                .isActive(true)
                .createdAt(now)
                .build();

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("alice");
        assertThat(response.getEmail()).isEqualTo("alice@example.com");
        assertThat(response.getName()).isEqualTo("Alice");
        assertThat(response.getRole()).isEqualTo(User.Role.ADMIN);
        assertThat(response.getIsActive()).isTrue();
        assertThat(response.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void settersAndGettersShouldWorkCorrectly() {

        LocalDateTime now = LocalDateTime.now();

        AdminUserResponse response = AdminUserResponse.builder().build();

        response.setId(2L);
        response.setUsername("bob");
        response.setEmail("bob@example.com");
        response.setName("Bob");
        response.setRole(User.Role.USER);
        response.setIsActive(false);
        response.setCreatedAt(now);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getUsername()).isEqualTo("bob");
        assertThat(response.getEmail()).isEqualTo("bob@example.com");
        assertThat(response.getName()).isEqualTo("Bob");
        assertThat(response.getRole()).isEqualTo(User.Role.USER);
        assertThat(response.getIsActive()).isFalse();
        assertThat(response.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void equalsHashCodeAndToStringShouldWork() {

        LocalDateTime now = LocalDateTime.now();

        AdminUserResponse response1 = AdminUserResponse.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .name("Alice")
                .role(User.Role.ADMIN)
                .isActive(true)
                .createdAt(now)
                .build();

        AdminUserResponse response2 = AdminUserResponse.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .name("Alice")
                .role(User.Role.ADMIN)
                .isActive(true)
                .createdAt(now)
                .build();

        assertThat(response1)
                .isEqualTo(response2)
                .hasSameHashCodeAs(response2);

        assertThat(response1.toString())
                .contains("username=alice")
                .contains("email=alice@example.com")
                .contains("name=Alice");
    }
}