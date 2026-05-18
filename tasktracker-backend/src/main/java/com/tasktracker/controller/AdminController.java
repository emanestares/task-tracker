package com.tasktracker.controller;

import com.tasktracker.dto.AdminStatsResponse;
import com.tasktracker.dto.AdminTaskResponse;
import com.tasktracker.dto.AdminUserResponse;
import com.tasktracker.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<AdminTaskResponse>> getAllTasks(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.getAllTasks());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.getStats());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        requireSuperAdmin(authentication);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<AdminUserResponse> deactivateUser(@PathVariable Long id, Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.deactivateUser(id));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<AdminUserResponse> activateUser(@PathVariable Long id, Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.activateUser(id));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> toggleUserRole(@PathVariable Long id, Authentication authentication) {
        requireSuperAdmin(authentication);
        return ResponseEntity.ok(adminService.toggleUserRole(id));
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch(authority -> "ROLE_ADMIN".equals(authority) || "ROLE_SUPER_ADMIN".equals(authority))) {
            throw new AccessDeniedException("Admin access required");
        }
    }

    private void requireSuperAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch("ROLE_SUPER_ADMIN"::equals)) {
            throw new AccessDeniedException("Super admin access required");
        }
    }
}