package com.ems.service;

import com.ems.dto.request.ManagerNoteRequest;
import com.ems.dto.response.ManagerNoteResponse;
import com.ems.entity.Employee;
import com.ems.entity.ManagerNote;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ManagerNoteRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerNoteService {

    private final ManagerNoteRepository managerNoteRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public List<ManagerNoteResponse> getNotesForEmployee(Long employeeId) {
        return managerNoteRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ManagerNoteResponse> getNotesByManager(String username) {
        Employee manager = getEmployeeByUsername(username);
        return managerNoteRepository.findByManagerId(manager.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ManagerNoteResponse addNote(ManagerNoteRequest request, String username) {
        Employee manager = getEmployeeByUsername(username);
        Employee employee = employeeRepository.findActiveById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Manager can only add notes for employees in their department
        if (manager.getDepartment() != null && employee.getDepartment() != null
                && !manager.getDepartment().getId().equals(employee.getDepartment().getId())) {
            throw new BadRequestException("You can only add notes for employees in your department");
        }

        ManagerNote note = ManagerNote.builder()
                .manager(manager)
                .employee(employee)
                .note(request.getNote())
                .build();
        return mapToResponse(managerNoteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long noteId, String username) {
        ManagerNote note = managerNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        Employee manager = getEmployeeByUsername(username);
        if (!note.getManager().getId().equals(manager.getId())) {
            throw new BadRequestException("You can only delete your own notes");
        }
        managerNoteRepository.delete(note);
    }

    private Employee getEmployeeByUsername(String username) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for: " + username));
    }

    private ManagerNoteResponse mapToResponse(ManagerNote n) {
        return ManagerNoteResponse.builder()
                .id(n.getId())
                .employeeId(n.getEmployee().getId())
                .employeeName(n.getEmployee().getFirstName() + " " + n.getEmployee().getLastName())
                .managerId(n.getManager().getId())
                .managerName(n.getManager().getFirstName() + " " + n.getManager().getLastName())
                .note(n.getNote())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
