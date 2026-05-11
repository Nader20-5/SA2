package com.smartrent.rental.repository;

import com.smartrent.rental.model.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    List<ApplicationDocument> findByApplicationId(Long applicationId);
    java.util.Optional<ApplicationDocument> findByFileUrl(String fileUrl);
}
