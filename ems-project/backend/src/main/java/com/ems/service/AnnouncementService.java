package com.ems.service;

import com.ems.dto.request.AnnouncementRequest;
import com.ems.dto.response.AnnouncementResponse;
import com.ems.entity.Announcement;
import com.ems.entity.User;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AnnouncementRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public List<AnnouncementResponse> getAllActive() {
        return announcementRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementResponse create(AnnouncementRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Announcement a = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .createdBy(user)
                .isActive(true)
                .build();
        return mapToResponse(announcementRepository.save(a));
    }

    @Transactional
    public void delete(Long id) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found: " + id));
        a.setIsActive(false);
        announcementRepository.save(a);
    }

    private AnnouncementResponse mapToResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .message(a.getMessage())
                .createdBy(a.getCreatedBy() != null ? a.getCreatedBy().getUsername() : "System")
                .isActive(a.getIsActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
