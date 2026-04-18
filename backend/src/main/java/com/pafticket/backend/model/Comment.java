package com.pafticket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    private String id;
    private String authorId;
    private String authorName;
    private String role; // e.g. "USER", "ADMIN", "TECHNICIAN"
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
