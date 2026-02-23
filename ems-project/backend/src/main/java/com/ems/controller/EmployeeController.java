package com.ems.controller;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.request.ResignRequest;
import com.ems.dto.request.UpdateProfileRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.EmployeeResponse;
import com.ems.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Employees", description = "Employee management endpoints")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get employees (admin: all, manager: own department only)")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<EmployeeResponse> employees;
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            employees = employeeService.getAllEmployees();
        } else {
            employees = employeeService.getEmployeesForManager(userDetails.getUsername());
        }
        return ResponseEntity.ok(ApiResponse.success("Employees fetched successfully", employees));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Employee fetched successfully", employeeService.getEmployeeById(id)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get own employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully",
                employeeService.getEmployeeByUsername(userDetails.getUsername())));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(ApiResponse.created("Employee created successfully",
                employeeService.createEmployee(request, userDetails.getUsername())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully",
                employeeService.updateEmployee(id, request, userDetails.getUsername())));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update own profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully",
                employeeService.updateOwnProfile(userDetails.getUsername(), request)));
    }

    @PostMapping("/me/resign")
    @Operation(summary = "Submit resignation")
    public ResponseEntity<ApiResponse<EmployeeResponse>> resign(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResignRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resignation submitted successfully",
                employeeService.resign(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete employee")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        employeeService.deleteEmployee(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
    }
}
