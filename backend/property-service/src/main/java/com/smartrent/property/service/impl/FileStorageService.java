package com.smartrent.property.service.impl;

import com.smartrent.property.exception.InvalidFileTypeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Handles persisting uploaded image files to the local filesystem.
 * <ul>
 *   <li>Naming: UUID + original extension</li>
 *   <li>Directory: uploads/</li>
 *   <li>Validation: ONLY image/jpeg and image/png accepted</li>
 * </ul>
 */
@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png"
    );

    private static final Path UPLOAD_DIR = Paths.get("uploads");

    /**
     * Validates the MIME type and stores the file on disk.
     *
     * @param file the uploaded multipart file
     * @return the relative path to the stored file (e.g. "uploads/uuid.jpg")
     * @throws InvalidFileTypeException if the content type is not image/jpeg or image/png
     */
    public String storeFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidFileTypeException(
                    "Invalid file type: " + contentType + ". Only JPEG and PNG images are accepted.");
        }

        try {
            Files.createDirectories(UPLOAD_DIR);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFilename = UUID.randomUUID() + extension;
            Path targetPath = UPLOAD_DIR.resolve(storedFilename);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored file: {}", targetPath);
            return "/uploads/" + storedFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a previously stored file from disk.
     *
     * @param filePath the relative path returned by {@link #storeFile}
     */
    public void deleteFile(String filePath) {
        try {
            // Convert URL path (e.g. "/uploads/uuid.jpg") to filesystem path
            String resolvedPath = filePath;
            if (resolvedPath.startsWith("/uploads/")) {
                resolvedPath = UPLOAD_DIR.resolve(resolvedPath.substring("/uploads/".length())).toString();
            }
            Path path = Paths.get(resolvedPath);
            Files.deleteIfExists(path);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", filePath, e.getMessage());
        }
    }
}
