package com.ems.controller;

import com.ems.dto.request.ManagerNoteRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.ManagerNoteResponse;
import com.ems.service.ManagerNoteService;
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
@RequestMapping("/api/manager-notes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Manager Notes", description = "Manager 1-on-1 notes on employees")
public class ManagerNoteController {

    private final ManagerNoteService managerNoteService;

    @GetMapping("/my-notes")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all notes written by the current manager")
    public ResponseEntity<ApiResponse<List<ManagerNoteResponse>>> getMyNotes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Notes fetched",
                managerNoteService.getNotesByManager(userDetails.getUsername())));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all notes for a specific employee")
    public ResponseEntity<ApiResponse<List<ManagerNoteResponse>>> getNotesForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success("Notes fetched",
                managerNoteService.getNotesForEmployee(employeeId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Add a note for an employee")
    public ResponseEntity<ApiResponse<ManagerNoteResponse>> addNote(
            @Valid @RequestBody ManagerNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(ApiResponse.created("Note added",
                managerNoteService.addNote(request, userDetails.getUsername())));
    }

    @DeleteMapping("/{noteId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Delete a note")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        managerNoteService.deleteNote(noteId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Note deleted"));
    }
}
