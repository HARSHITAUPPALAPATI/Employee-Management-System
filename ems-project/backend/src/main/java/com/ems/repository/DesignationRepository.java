package com.ems.repository;

import com.ems.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    boolean existsByTitle(String title);

    @Query("SELECT d FROM Designation d WHERE d.deletedAt IS NULL")
    List<Designation> findAllActive();

    @Query("SELECT d FROM Designation d WHERE d.id = :id AND d.deletedAt IS NULL")
    Optional<Designation> findActiveById(Long id);
}
