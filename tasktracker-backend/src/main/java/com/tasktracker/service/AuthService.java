package com.tasktracker.service;

import com.tasktracker.dto.LoginRequest;
import com.tasktracker.dto.EditProfileRequest;
import com.tasktracker.dto.RegisterRequest;
import com.tasktracker.entity.User;
import com.tasktracker.exception.FieldValidationException;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public Map<String, String> register(RegisterRequest request) {

        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByUsername(request.getUsername())) {
            errors.put("username", "Username already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            errors.put("email", "Email already registered");
        }

        if (!errors.isEmpty()) {
            throw new FieldValidationException(errors);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        return Map.of("message", "User registered successfully");
    }

        public Map<String, Object> login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtUtil.generateToken(auth.getName());
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        var userMap = Map.of(
            "username", user.getUsername(),
            "email", user.getEmail(),
            "name", user.getFullName() != null ? user.getFullName() : user.getUsername(),
            "role", user.getRole().name()
        );

        return Map.of("token", token, "user", userMap);
        }

    public Map<String, Object> editProfile(EditProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Not authenticated");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            userRepository.findByUsername(request.getUsername())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> { throw new RuntimeException("Username already taken"); });
            user.setUsername(request.getUsername().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            userRepository.findByEmail(request.getEmail())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> { throw new RuntimeException("Email already registered"); });
            user.setEmail(request.getEmail().trim());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setFullName(request.getName().trim());
        }

        if (request.getPassword() != null || request.getCurrentPassword() != null) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new RuntimeException("Current password is required");
            }
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new RuntimeException("New password is required");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);

    String token = jwtUtil.generateToken(user.getUsername());

        return Map.of(
        "token", token,
                "username", user.getUsername(),
                "email", user.getEmail(),
                "name", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "role", user.getRole().name()
        );
    }
}