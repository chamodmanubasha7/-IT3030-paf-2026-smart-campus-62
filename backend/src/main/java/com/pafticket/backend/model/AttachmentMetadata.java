package com.pafticket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentMetadata {
    private String filename;
    private String originalName;
    private String contentType;
    private long size;
    private LocalDateTime uploadedAt;
}
