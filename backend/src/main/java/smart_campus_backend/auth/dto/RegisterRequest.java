package smart_campus_backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String contactNo;
    private String academicYear;
    private String semester;
    private String role;
    private String adminPasscode;
    
    // Additional Profile Details
    private String studentId;
    private String companyId;
    private String department;
    private String designation;
    private String bio;
    private String officeLocation;
    private String emergencyContact;
    private String socialLink;
}
