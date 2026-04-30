package smart_campus_backend.modulec.ticket.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.modulec.ticket.TicketCategory;
import smart_campus_backend.modulec.ticket.TicketContactMethod;
import smart_campus_backend.modulec.ticket.TicketPriority;
import smart_campus_backend.modulec.ticket.TicketStatus;

import java.time.Instant;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String title;

    private TicketCategory category;

    private String description;

    private TicketPriority priority;

    private String preferredContactDetails;

    @Builder.Default
    private TicketContactMethod preferredContactMethod = TicketContactMethod.ANY;

    private String locationOrResource;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String rejectionReason;

    private String resolutionNotes;

    @DBRef
    private User assignedTechnician;

    @DBRef
    private User createdBy;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
