package smart_campus_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleTokenRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;
}
