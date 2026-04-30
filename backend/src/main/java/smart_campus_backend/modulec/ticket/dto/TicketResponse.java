package smart_campus_backend.modulec.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import smart_campus_backend.modulec.ticket.TicketCategory;
import smart_campus_backend.modulec.ticket.TicketContactMethod;
import smart_campus_backend.modulec.ticket.TicketPriority;
import smart_campus_backend.modulec.ticket.TicketStatus;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private String id;
    private String title;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private String preferredContactDetails;
    private TicketContactMethod preferredContactMethod;
    private String locationOrResource;
    private TicketStatus status;
    private String rejectionReason;
    private String resolutionNotes;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
}
