package com.tasktracker.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();

        Field secretField = JwtUtil.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(jwtUtil, "01234567890123456789012345678901");

        Field expirationField = JwtUtil.class.getDeclaredField("expirationMs");
        expirationField.setAccessible(true);
        expirationField.set(jwtUtil, 60000L);
    }

    @Test
    void generateToken_andExtractUsername_shouldWork() {
        String token = jwtUtil.generateToken("john");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("john");
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForInvalidToken() {
        assertThat(jwtUtil.isTokenValid("invalid-token")).isFalse();
    }
}
