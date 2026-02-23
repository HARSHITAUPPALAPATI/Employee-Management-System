package com.ems.repository;

import com.ems.entity.ManagerNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ManagerNoteRepository extends JpaRepository<ManagerNote, Long> {
    @Query("SELECT n FROM ManagerNote n WHERE n.employee.id = :employeeId ORDER BY n.createdAt DESC")
    List<ManagerNote> findByEmployeeId(Long employeeId);

    @Query("SELECT n FROM ManagerNote n WHERE n.manager.id = :managerId ORDER BY n.createdAt DESC")
    List<ManagerNote> findByManagerId(Long managerId);
}
