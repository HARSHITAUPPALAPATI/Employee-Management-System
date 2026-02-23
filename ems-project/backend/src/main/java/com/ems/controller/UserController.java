package com.ems.controller;

import com.ems.dto.request.AssignRoleRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.UserResponse;
import com.ems.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", userService.getUserById(id)));
    }

    @PostMapping("/{id}/assign-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable Long id, @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", userService.assignRole(id, request)));
    }

    @DeleteMapping("/{id}/remove-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Remove role from user")
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable Long id, @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", userService.removeRole(id, request)));
    }

    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Lock user account")
    public ResponseEntity<ApiResponse<UserResponse>> lockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User locked successfully", userService.lockUser(id)));
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Unlock user account")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User unlocked successfully", userService.unlockUser(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}
