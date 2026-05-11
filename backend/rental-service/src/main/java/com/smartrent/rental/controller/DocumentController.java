package com.smartrent.rental.controller;

import com.smartrent.rental.exception.RentalApplicationNotFoundException;
import com.smartrent.rental.exception.UnauthorizedRentalActionException;
import com.smartrent.rental.model.ApplicationDocument;
import com.smartrent.rental.model.RentalApplication;
import com.smartrent.rental.repository.ApplicationDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api/Document")
@RequiredArgsConstructor
public class DocumentController {

    private final ApplicationDocumentRepository documentRepository;

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadDocument(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam("url") String url) {

        log.info("Request to download document: {} by user: {} (Role: {})", url, userId, role);

        ApplicationDocument doc = documentRepository.findByFileUrl(url)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Document not found with URL: " + url));

        RentalApplication app = doc.getApplication();

        // Authorization check: Only Admin, the Tenant who uploaded, or the Landlord who received can download
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isTenant = app.getTenantId().equals(userId);
        boolean isLandlord = app.getLandlordId().equals(userId);

        if (!isAdmin && !isTenant && !isLandlord) {
            log.warn("Unauthorized access attempt to document {} by user {}", url, userId);
            throw new UnauthorizedRentalActionException("You are not authorized to access this document");
        }

        try {
            // fileUrl in DB is e.g. "/uploads/uuid.pdf"
            // FileStorageService stores in "uploads/" directory relative to app root
            String relativePath = url.startsWith("/") ? url.substring(1) : url;
            Path path = Paths.get(relativePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                log.error("File not found on disk: {}", path);
                throw new RentalApplicationNotFoundException("File not found on server");
            }

            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving file {}: {}", url, e.getMessage());
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }
}
