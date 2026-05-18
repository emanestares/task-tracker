package com.tasktracker.config;

import com.tasktracker.entity.User;
import com.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationConfigTest {

    @Mock private UserRepository userRepository;
    private ApplicationConfig config;

    @BeforeEach
    void setUp() {
        config = new ApplicationConfig(userRepository);
    }

    @Test
    void userDetailsService_shouldLoadExistingUser() {
        User user = User.builder()
                .id(1L)
                .username("john")
                .password("encoded")
                .role(User.Role.USER)
                .build();

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        UserDetailsService service = config.userDetailsService();
        UserDetails userDetails = service.loadUserByUsername("john");

        assertThat(userDetails.getUsername()).isEqualTo("john");
        assertThat(userDetails.getPassword()).isEqualTo("encoded");
        assertThat(userDetails.getAuthorities()).isNotEmpty();
    }

    @Test
    void userDetailsService_shouldThrowWhenUserNotFound() {
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        UserDetailsService service = config.userDetailsService();

        assertThatThrownBy(() -> service.loadUserByUsername("missing"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found: missing");
    }

    @Test
    void passwordEncoder_shouldReturnBCryptEncoder() {
        assertThat(config.passwordEncoder()).isNotNull();
    }

    @Test
    void corsConfigurationSource_shouldAllowFrontendOrigins() {
        CorsConfigurationSource source = config.corsConfigurationSource();
        assertThat(source).isNotNull();
    }
}
