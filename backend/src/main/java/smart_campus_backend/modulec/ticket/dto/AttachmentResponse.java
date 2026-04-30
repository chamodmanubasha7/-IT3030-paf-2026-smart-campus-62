package smart_campus_backend.modulec.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {

    private String id;
    private String fileName;
    private String filePath;
    private String cloudinaryPublicId;
    private String uploadedById;
    private String uploadedByName;
    private Instant uploadedAt;
}
