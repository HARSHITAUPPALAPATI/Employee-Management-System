package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUser(User user);
    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE e.deletedAt IS NULL")
    List<Employee> findAllActive();

    @Query("SELECT e FROM Employee e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Employee> findActiveById(Long id);

    @Query("SELECT e FROM Employee e WHERE e.department.id = :deptId AND e.deletedAt IS NULL")
    List<Employee> findByDepartmentId(Long deptId);
}
