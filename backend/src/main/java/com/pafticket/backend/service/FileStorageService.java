package com.pafticket.backend.service;

import com.pafticket.backend.model.AttachmentMetadata;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:./uploads/tickets}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public AttachmentMetadata storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.lastIndexOf(".") > 0) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        String savedFileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(savedFileName);
            Files.copy(file.getInputStream(), targetLocation);
            
            return AttachmentMetadata.builder()
                    .filename(savedFileName)
                    .originalName(originalFileName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
    
    public File getFile(String filename) {
        return this.fileStorageLocation.resolve(filename).toFile();
    }
}
