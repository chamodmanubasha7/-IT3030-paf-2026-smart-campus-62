package smart_campus_backend.auth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "admin_invites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInvite {

    @Id
    private String id;

    private String email;

    private String token;

    @Builder.Default
    private Role targetRole = Role.ADMIN;

    @Builder.Default
    private InviteStatus status = InviteStatus.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;
}
