package com.tasktracker.service;

import com.tasktracker.dto.EditProfileRequest;
import com.tasktracker.dto.LoginRequest;
import com.tasktracker.dto.RegisterRequest;
import com.tasktracker.entity.User;
import com.tasktracker.exception.FieldValidationException;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("john")
                .email("john@example.com")
                .fullName("John Doe")
                .password("encoded-password")
                .role(User.Role.USER)
                .isActive(true)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRegisterSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");

        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(user);

        Map<String, String> result = authService.register(request);

        assertThat(result).containsEntry("message", "User registered successfully");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowWhenUsernameAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");

        when(userRepository.existsByUsername("john")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(FieldValidationException.class)
                .hasMessageContaining("Validation failed");
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john");
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");

        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(FieldValidationException.class)
                .hasMessageContaining("Validation failed");
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest();
        request.setUsername("john");
        request.setPassword("password");

        Authentication auth = new UsernamePasswordAuthenticationToken("john", "password");

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("john")).thenReturn("jwt-token");

        Map<String, Object> result = authService.login(request);

        assertThat(result).containsEntry("token", "jwt-token");
        assertThat(result).containsKey("user");
        assertThat(((Map<?, ?>) result.get("user")).get("username")).isEqualTo("john");
        verify(jwtUtil).generateToken("john");
    }

    @Test
    void shouldThrowWhenAccountInactive() {
        LoginRequest request = new LoginRequest();
        request.setUsername("john");
        request.setPassword("password");

        user.setIsActive(false);
        Authentication auth = new UsernamePasswordAuthenticationToken("john", "password");

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("Account is inactive");
    }

    @Test
    void shouldEditProfileSuccessfully() {
        EditProfileRequest request = new EditProfileRequest();
        request.setUsername("johnny");
        request.setEmail("johnny@example.com");
        request.setName("Johnny Doe");
        request.setCurrentPassword("password");
        request.setPassword("new-password");

        Authentication auth = new UsernamePasswordAuthenticationToken("john", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("johnny")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("johnny@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken("johnny")).thenReturn("new-token");

        Map<String, Object> response = authService.editProfile(request);

        assertThat(response).containsEntry("token", "new-token");
        assertThat(response).containsEntry("username", "johnny");
        assertThat(response).containsEntry("email", "johnny@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowOnDuplicateUsernameDuringEdit() {
        EditProfileRequest request = new EditProfileRequest();
        request.setUsername("admin");
        request.setEmail("john@example.com");
        request.setName("John Doe");

        Authentication auth = new UsernamePasswordAuthenticationToken("john", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);

        User existing = User.builder().id(2L).username("admin").build();

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> authService.editProfile(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void shouldThrowWhenCurrentPasswordIsIncorrectOnEdit() {
        EditProfileRequest request = new EditProfileRequest();
        request.setUsername("john");
        request.setEmail("john@example.com");
        request.setName("John Doe");
        request.setCurrentPassword("wrong");
        request.setPassword("new-password");

        Authentication auth = new UsernamePasswordAuthenticationToken("john", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.editProfile(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Current password is incorrect");
    }
}
