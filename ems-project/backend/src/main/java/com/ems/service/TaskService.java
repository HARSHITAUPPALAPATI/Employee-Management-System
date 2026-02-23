package com.ems.service;

import com.ems.dto.request.TaskRequest;
import com.ems.dto.response.TaskResponse;
import com.ems.entity.Employee;
import com.ems.entity.Task;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.TaskRepository;
import com.ems.repository.UserRepository;
import com.ems.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse createTask(TaskRequest request, String managerUsername) {
        User managerUser = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee manager = employeeRepository.findByUser(managerUser)
                .orElseThrow(() -> new ResourceNotFoundException("Manager employee profile not found"));

        Employee assignedTo = employeeRepository.findActiveById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getAssignedToId()));

        // Managers can only assign tasks to employees in their department
        boolean isAdmin = managerUser.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            if (manager.getDepartment() == null || assignedTo.getDepartment() == null ||
                !manager.getDepartment().getId().equals(assignedTo.getDepartment().getId())) {
                throw new BadRequestException("You can only assign tasks to employees in your department");
            }
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .assignedTo(assignedTo)
                .assignedBy(manager)
                .deadline(request.getDeadline())
                .priority(Task.TaskPriority.valueOf(request.getPriority().toUpperCase()))
                .status(Task.TaskStatus.PENDING)
                .build();

        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, String status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));
        boolean isAssignee = task.getAssignedTo().getId().equals(employee.getId());
        boolean isAssigner = task.getAssignedBy().getId().equals(employee.getId());

        if (!isAdmin && !isAssignee && !isAssigner) {
            throw new BadRequestException("You are not authorized to update this task");
        }

        Task.TaskStatus newStatus = Task.TaskStatus.valueOf(status.toUpperCase());
        task.setStatus(newStatus);
        if (newStatus == Task.TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee manager = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isAssigner = task.getAssignedBy().getId().equals(manager.getId());

        if (!isAdmin && !isAssigner) {
            throw new BadRequestException("You can only delete tasks you created");
        }

        taskRepository.delete(task);
    }

    public List<TaskResponse> getMyTasks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        return taskRepository.findByAssignedToOrderByDeadlineAsc(employee)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksAssignedByMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee manager = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        return taskRepository.findByAssignedByOrderByCreatedAtDesc(manager)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TaskResponse mapToResponse(Task task) {
        boolean overdue = task.getStatus() != Task.TaskStatus.COMPLETED
                && task.getDeadline().isBefore(LocalDate.now());
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .assignedToId(task.getAssignedTo().getId())
                .assignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName())
                .assignedById(task.getAssignedBy().getId())
                .assignedByName(task.getAssignedBy().getFirstName() + " " + task.getAssignedBy().getLastName())
                .deadline(task.getDeadline())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .overdue(overdue)
                .build();
    }
}
