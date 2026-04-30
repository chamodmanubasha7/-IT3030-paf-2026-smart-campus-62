package smart_campus_backend.auth.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileImageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.api-key:test}")
    private String cloudinaryApiKey;

    @Value("${app.upload.base-url:http://localhost:8080}")
    private String uploadBaseUrl;

    public String uploadProfileImage(MultipartFile file, String userId) {
        // Fallback to local storage if Cloudinary is not properly configured (stays as "test" or "demo")
        if ("test".equalsIgnoreCase(cloudinaryApiKey) || "demo".equalsIgnoreCase(cloudinaryApiKey)) {
            return saveLocally(file, userId);
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "smart-campus/profile-images",
                            "public_id", "user-" + userId,
                            "overwrite", true,
                            "invalidate", true,
                            "resource_type", "image",
                            "transformation", "f_auto,q_auto:good"
                    )
            );
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                return saveLocally(file, userId); // Second fallback
            }
            return secureUrl.toString();
        } catch (Exception ex) {
            // Log error and fallback to local
            System.err.println("Cloudinary upload failed, falling back to local: " + ex.getMessage());
            return saveLocally(file, userId);
        }
    }

    private String saveLocally(MultipartFile file, String userId) {
        try {
            String folder = "uploads/profile-images";
            java.io.File directory = new java.io.File(folder);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String extension = "jpg";
            String contentType = file.getContentType();
            if (contentType != null && contentType.contains("/")) {
                extension = contentType.split("/")[1];
            }

            String filename = "user-" + userId + "." + extension;
            java.nio.file.Path path = java.nio.file.Paths.get(folder, filename);
            java.nio.file.Files.write(path, file.getBytes());

            return uploadBaseUrl + "/uploads/profile-images/" + filename + "?v=" + System.currentTimeMillis();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save profile image locally", e);
        }
    }
}
