package com.pafticket.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "maintenance_tickets")
public class MaintenanceTicket {
    @Id
    private String id;
    private String ticketNumber; // e.g. TKT-2024-001
    
    private Category category;
    private String description;
    private Priority priority;
    private Status status;
    
    private String reportedById;
    private String reportedByName;
    
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    
    // Preferred Contact Details nested or flat
    private String contactEmail;
    private String contactPhone;
    private String preferredContactMethod; // "EMAIL" or "PHONE"
    
    @Builder.Default
    private List<AttachmentMetadata> attachments = new ArrayList<>();
    
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();
    
    private String resolutionNotes;
    private String rejectionReason;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
