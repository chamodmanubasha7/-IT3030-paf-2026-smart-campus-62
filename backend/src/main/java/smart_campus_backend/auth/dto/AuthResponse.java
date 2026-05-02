package smart_campus_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String email;
    private String profileImageUrl;
    private String role;
    private String contactNo;
    private String academicYear;
    private String semester;
    private String studentId;
    private String companyId;
    private String department;
    private String designation;
    private String bio;
    private String officeLocation;
    private String emergencyContact;
    private String socialLink;
}
