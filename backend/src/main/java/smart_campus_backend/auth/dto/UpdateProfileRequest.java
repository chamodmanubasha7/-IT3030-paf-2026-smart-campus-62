package smart_campus_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String profileImageUrl;
    
    // Extended Details
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
