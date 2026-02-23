package com.ems.service;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.request.ResignRequest;
import com.ems.dto.request.UpdateProfileRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.entity.*;
import com.ems.exception.BadRequestException;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesForManager(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Employee manager = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for manager: " + username));
        if (manager.getDepartment() == null) {
            return List.of();
        }
        return employeeRepository.findByDepartmentId(manager.getDepartment().getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponse(emp);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Employee emp = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for: " + username));
        return mapToResponse(emp);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request, String performedBy) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee email already exists: " + request.getEmail());
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
            if (employeeRepository.findByUser(user).isPresent()) {
                throw new DuplicateResourceException("Employee profile already exists for this user");
            }
        }

        final User finalUser = user;
        Employee emp = Employee.builder()
                .user(finalUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .dateOfJoining(request.getDateOfJoining())
                .salary(request.getSalary())
                .isActive(true)
                .employmentStatus(Employee.EmploymentStatus.ACTIVE)
                .build();

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findActiveById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            emp.setDepartment(dept);
        }

        if (request.getDesignationId() != null) {
            Designation desig = designationRepository.findActiveById(request.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
            emp.setDesignation(desig);
        }

        if (request.getReportingManagerId() != null) {
            Employee manager = employeeRepository.findActiveById(request.getReportingManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reporting manager not found"));
            emp.setReportingManager(manager);
        }

        Employee saved = employeeRepository.save(emp);
        auditLogService.log("CREATE", "EMPLOYEE", saved.getId(), performedBy,
                "Created employee: " + saved.getFirstName() + " " + saved.getLastName());
        log.info("Employee created: {} {}", saved.getFirstName(), saved.getLastName());
        return mapToResponse(saved);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request, String performedBy) {
        Employee emp = employeeRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!emp.getEmail().equals(request.getEmail()) && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setEmail(request.getEmail());
        emp.setPhone(request.getPhone());
        emp.setDateOfBirth(request.getDateOfBirth());
        emp.setDateOfJoining(request.getDateOfJoining());
        emp.setSalary(request.getSalary());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findActiveById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            emp.setDepartment(dept);
        } else {
            emp.setDepartment(null);
        }

        if (request.getDesignationId() != null) {
            Designation desig = designationRepository.findActiveById(request.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
            emp.setDesignation(desig);
        } else {
            emp.setDesignation(null);
        }

        if (request.getReportingManagerId() != null) {
            if (request.getReportingManagerId().equals(id)) {
                throw new BadRequestException("Employee cannot be their own reporting manager");
            }
            Employee manager = employeeRepository.findActiveById(request.getReportingManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reporting manager not found"));
            emp.setReportingManager(manager);
        } else {
            emp.setReportingManager(null);
        }

        Employee saved = employeeRepository.save(emp);
        auditLogService.log("UPDATE", "EMPLOYEE", saved.getId(), performedBy,
                "Updated employee: " + saved.getFirstName() + " " + saved.getLastName());
        return mapToResponse(saved);
    }

    @Transactional
    public EmployeeResponse updateOwnProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee emp = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        if (request.getFirstName() != null) emp.setFirstName(request.getFirstName());
        if (request.getLastName() != null) emp.setLastName(request.getLastName());
        if (request.getPhone() != null) emp.setPhone(request.getPhone());

        if (request.getEmail() != null && !request.getEmail().equals(emp.getEmail())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already in use: " + request.getEmail());
            }
            emp.setEmail(request.getEmail());
            user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        return mapToResponse(employeeRepository.save(emp));
    }

    @Transactional
    public EmployeeResponse resign(String username, ResignRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee emp = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        if (emp.getEmploymentStatus() == Employee.EmploymentStatus.NOTICE_PERIOD) {
            throw new BadRequestException("You have already submitted your resignation");
        }
        if (emp.getEmploymentStatus() == Employee.EmploymentStatus.RESIGNED) {
            throw new BadRequestException("You have already resigned");
        }

        LocalDate today = LocalDate.now();
        if (request.getLastWorkingDay().isBefore(today)) {
            throw new BadRequestException("Last working day must be in the future");
        }

        emp.setEmploymentStatus(Employee.EmploymentStatus.NOTICE_PERIOD);
        emp.setResignationDate(today);
        emp.setNoticePeriodEndDate(request.getLastWorkingDay());

        auditLogService.log("RESIGN", "EMPLOYEE", emp.getId(), username,
                "Employee submitted resignation. Last working day: " + request.getLastWorkingDay());

        return mapToResponse(employeeRepository.save(emp));
    }

    @Transactional
    public void deleteEmployee(Long id, String performedBy) {
        Employee emp = employeeRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        emp.setDeletedAt(LocalDateTime.now());
        emp.setIsActive(false);
        employeeRepository.save(emp);
        auditLogService.log("DELETE", "EMPLOYEE", id, performedBy,
                "Deleted employee: " + emp.getFirstName() + " " + emp.getLastName());
        log.info("Employee soft deleted: {} {}", emp.getFirstName(), emp.getLastName());
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        return EmployeeResponse.builder()
                .id(emp.getId())
                .userId(emp.getUser() != null ? emp.getUser().getId() : null)
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .dateOfBirth(emp.getDateOfBirth())
                .dateOfJoining(emp.getDateOfJoining())
                .salary(emp.getSalary())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .designationId(emp.getDesignation() != null ? emp.getDesignation().getId() : null)
                .designationTitle(emp.getDesignation() != null ? emp.getDesignation().getTitle() : null)
                .reportingManagerId(emp.getReportingManager() != null ? emp.getReportingManager().getId() : null)
                .reportingManagerName(emp.getReportingManager() != null
                        ? emp.getReportingManager().getFirstName() + " " + emp.getReportingManager().getLastName() : null)
                .isActive(emp.getIsActive())
                .employmentStatus(emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "ACTIVE")
                .resignationDate(emp.getResignationDate())
                .noticePeriodEndDate(emp.getNoticePeriodEndDate())
                .createdAt(emp.getCreatedAt())
                .build();
    }
}
