package com.tasktracker.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void shouldSetTimestampsOnCreate() {
        User user = new User();

        user.onCreate();

        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldUpdateTimestampOnUpdate() throws InterruptedException {
        User user = new User();

        user.onCreate();
        LocalDateTime first = user.getUpdatedAt();

        Thread.sleep(5);

        user.onUpdate();

        assertThat(user.getUpdatedAt()).isAfter(first);
    }

    @Test
    void shouldBuildUserWithRoleDefaultWhenUsingConstructor() {
        User user = User.builder()
                .username("john")
                .email("john@test.com")
                .password("secret")
                .build();

        assertThat(user.getUsername()).isEqualTo("john");
        assertThat(user.getRole()).isNull(); // important reality check
    }
}