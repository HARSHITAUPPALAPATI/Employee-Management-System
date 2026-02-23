package com.ems.repository;

import com.ems.entity.Task;
import com.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToOrderByDeadlineAsc(Employee employee);
    List<Task> findByAssignedByOrderByCreatedAtDesc(Employee manager);
    List<Task> findByAssignedTo_Department_IdOrderByDeadlineAsc(Long departmentId);
}
