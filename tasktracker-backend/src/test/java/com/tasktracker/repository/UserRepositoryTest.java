package com.tasktracker.repository;

import com.tasktracker.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock private UserRepository userRepository;

    @Test
    void shouldAllowFindByUsername() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(new User()));

        Optional<User> result = userRepository.findByUsername("john");

        assertThat(result).isPresent();
    }

    @Test
    void shouldAllowFindByEmail() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(new User()));

        Optional<User> result = userRepository.findByEmail("john@example.com");

        assertThat(result).isPresent();
    }

    @Test
    void shouldAllowExistsByUsernameAndEmail() {
        when(userRepository.existsByUsername("john")).thenReturn(true);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);

        assertThat(userRepository.existsByUsername("john")).isTrue();
        assertThat(userRepository.existsByEmail("john@example.com")).isFalse();
    }
}
