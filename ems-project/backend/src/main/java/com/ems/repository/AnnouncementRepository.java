package com.ems.repository;

import com.ems.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true ORDER BY a.createdAt DESC")
    List<Announcement> findAllActive();
}
