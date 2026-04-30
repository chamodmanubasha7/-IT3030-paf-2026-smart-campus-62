package smart_campus_backend.modulec.ticket.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import smart_campus_backend.auth.entity.User;

import java.time.Instant;

@Document(collection = "ticket_attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {

    @Id
    private String id;

    @DBRef
    private Ticket ticket;

    private String fileName;

    private String filePath;

    private String cloudinaryPublicId;

    @DBRef
    private User uploadedBy;

    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
