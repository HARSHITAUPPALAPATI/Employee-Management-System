package com.ems.service;

import com.ems.dto.request.DesignationRequest;
import com.ems.dto.response.DesignationResponse;
import com.ems.entity.Designation;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignationService {

    private final DesignationRepository designationRepository;

    @Transactional(readOnly = true)
    public List<DesignationResponse> getAllDesignations() {
        return designationRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DesignationResponse getDesignationById(Long id) {
        Designation d = designationRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + id));
        return mapToResponse(d);
    }

    @Transactional
    public DesignationResponse createDesignation(DesignationRequest request) {
        if (designationRepository.existsByTitle(request.getTitle())) {
            throw new DuplicateResourceException("Designation already exists: " + request.getTitle());
        }
        Designation d = Designation.builder().title(request.getTitle()).build();
        Designation saved = designationRepository.save(d);
        log.info("Designation created: {}", saved.getTitle());
        return mapToResponse(saved);
    }

    @Transactional
    public DesignationResponse updateDesignation(Long id, DesignationRequest request) {
        Designation d = designationRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + id));

        if (!d.getTitle().equals(request.getTitle()) && designationRepository.existsByTitle(request.getTitle())) {
            throw new DuplicateResourceException("Designation title already in use: " + request.getTitle());
        }

        d.setTitle(request.getTitle());
        return mapToResponse(designationRepository.save(d));
    }

    @Transactional
    public void deleteDesignation(Long id) {
        Designation d = designationRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + id));
        d.setDeletedAt(LocalDateTime.now());
        designationRepository.save(d);
        log.info("Designation soft deleted: {}", d.getTitle());
    }

    private DesignationResponse mapToResponse(Designation d) {
        return DesignationResponse.builder()
                .id(d.getId())
                .title(d.getTitle())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
