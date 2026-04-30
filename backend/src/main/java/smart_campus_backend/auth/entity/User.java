package smart_campus_backend.auth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Field("email")
    private String email;

    private String profileImageUrl;

    private String contactNo;

    private String academicYear;

    private String semester;

    // Nullable — Google OAuth users have no local password
    private String password;

    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Builder.Default
    private boolean enabled = true;

    // Stores the Google sub (subject) ID for OAuth users
    private String providerId;
}
