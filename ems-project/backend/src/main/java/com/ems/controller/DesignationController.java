package com.ems.controller;

import com.ems.dto.request.DesignationRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.DesignationResponse;
import com.ems.service.DesignationService;
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
@RequestMapping("/api/designations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Designations", description = "Designation management endpoints")
public class DesignationController {

    private final DesignationService designationService;

    @GetMapping
    @Operation(summary = "Get all designations")
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getAllDesignations() {
        return ResponseEntity.ok(ApiResponse.success("Designations fetched successfully", designationService.getAllDesignations()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get designation by ID")
    public ResponseEntity<ApiResponse<DesignationResponse>> getDesignationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Designation fetched successfully", designationService.getDesignationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create designation")
    public ResponseEntity<ApiResponse<DesignationResponse>> createDesignation(@Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created("Designation created successfully", designationService.createDesignation(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update designation")
    public ResponseEntity<ApiResponse<DesignationResponse>> updateDesignation(
            @PathVariable Long id, @Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Designation updated successfully", designationService.updateDesignation(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete designation")
    public ResponseEntity<ApiResponse<Void>> deleteDesignation(@PathVariable Long id) {
        designationService.deleteDesignation(id);
        return ResponseEntity.ok(ApiResponse.success("Designation deleted successfully"));
    }
}
