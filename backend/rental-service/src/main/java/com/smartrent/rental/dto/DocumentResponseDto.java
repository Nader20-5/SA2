package com.smartrent.rental.dto;

import com.smartrent.rental.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDto {
    private Long id;
    private DocumentType documentType;
    private String fileName;
    private String fileUrl;
    private Long fileSizeBytes;
    private LocalDateTime uploadedAt;
}
