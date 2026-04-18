package com.pafticket.backend.controller;

import com.pafticket.backend.model.*;
import com.pafticket.backend.repository.TicketRepository;
import com.pafticket.backend.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final FileStorageService fileStorageService;

    public TicketController(TicketRepository ticketRepository, FileStorageService fileStorageService) {
        this.ticketRepository = ticketRepository;
        this.fileStorageService = fileStorageService;
    }

    // 1. POST /api/tickets - Create ticket (Multipart to handle 3 images)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTicket(
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Anonymous") String userName,
            @RequestParam("category") Category category,
            @RequestParam("description") String description,
            @RequestParam("priority") Priority priority,
            @RequestParam(value = "contactEmail", required = false) String contactEmail,
            @RequestParam(value = "contactPhone", required = false) String contactPhone,
            @RequestParam(value = "preferredContactMethod", defaultValue = "EMAIL") String preferredContactMethod,
            @RequestParam(value = "files", required = false) MultipartFile[] files) {

        if (files != null && files.length > 3) {
            return ResponseEntity.badRequest().body("Maximum of 3 files allowed.");
        }

        List<AttachmentMetadata> uploadedAttachments = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    AttachmentMetadata meta = fileStorageService.storeFile(file);
                    if (meta != null) {
                        uploadedAttachments.add(meta);
                    }
                }
            }
        }

        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .ticketNumber("TKT-" + System.currentTimeMillis() % 100000)
                .category(category)
                .description(description)
                .priority(priority)
                .status(Status.OPEN)
                .reportedById(userId)
                .reportedByName(userName)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .preferredContactMethod(preferredContactMethod)
                .attachments(uploadedAttachments)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticketRepository.save(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // 2. GET /api/tickets/{id} - Retrieve full ticket details + comments
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable String id) {
        Optional<MaintenanceTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticketOpt.get());
    }

    // Helper: GET all tickets for a user or all if admin
    @GetMapping
    public ResponseEntity<List<MaintenanceTicket>> getAllTickets(
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String role,
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId) {
        
        if ("ADMIN".equals(role) || "TECHNICIAN".equals(role)) {
            return ResponseEntity.ok(ticketRepository.findAll());
        } else {
            // USER sees only their own tickets using reportedById
            // Since we don't have a specific method in mongo repo without custom interface, 
            // we will filter in memory, though normally we'd write findByReportedById in repo.
            List<MaintenanceTicket> all = ticketRepository.findAll();
            return ResponseEntity.ok(all.stream()
                .filter(t -> userId.equals(t.getReportedById()))
                .toList());
        }
    }

    // 3. PUT /api/tickets/{id}/status - Update workflow status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String role,
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId,
            @RequestBody Map<String, String> payload) {
        
        if (!"ADMIN".equals(role) && !"TECHNICIAN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN or TECHNICIAN can update status.");
        }

        Optional<MaintenanceTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        MaintenanceTicket ticket = ticketOpt.get();
        String statusStr = payload.get("status");
        if (statusStr != null) {
            try {
                ticket.setStatus(Status.valueOf(statusStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status.");
            }
        }
        
        if (payload.containsKey("rejectionReason")) {
            ticket.setRejectionReason(payload.get("rejectionReason"));
        }
        if (payload.containsKey("resolutionNotes")) {
            ticket.setResolutionNotes(payload.get("resolutionNotes"));
        }

        // Technically setting assigned tech here as well if they start progress
        if ("IN_PROGRESS".equals(statusStr) && ticket.getAssignedTechnicianId() == null) {
            ticket.setAssignedTechnicianId(userId); // Self-assign
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(ticket);
    }

    // Add Comment (Not asked as 1 of the 4, but needed for the nested comment sys)
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Anonymous") String userName,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole,
            @RequestBody Map<String, String> payload) {
        
        Optional<MaintenanceTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        MaintenanceTicket ticket = ticketOpt.get();
        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .authorId(userId)
                .authorName(userName)
                .role(userRole)
                .text(payload.get("text"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        // ensure initialized
        if(ticket.getComments() == null) { ticket.setComments(new ArrayList<>()); }            
        ticket.getComments().add(comment);
        ticketRepository.save(ticket);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    // 4. DELETE /api/tickets/{id}/comments/{commentId} - Delete a comment
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String role) {
        
        Optional<MaintenanceTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        MaintenanceTicket ticket = ticketOpt.get();
        if(ticket.getComments() == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Comment> commentOpt = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId)).findFirst();
                
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Comment comment = commentOpt.get();
        // Ownership rules: Must be the author OR an ADMIN
        if (!comment.getAuthorId().equals(userId) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own comments.");
        }
        
        ticket.getComments().remove(comment);
        ticketRepository.save(ticket);
        
        return ResponseEntity.noContent().build();
    }
    
    // 5. PUT /api/tickets/{id}/comments/{commentId} - Edit a comment
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "anon") String userId,
            @RequestBody Map<String, String> payload) {
        
        Optional<MaintenanceTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        MaintenanceTicket ticket = ticketOpt.get();
        if(ticket.getComments() == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Comment> commentOpt = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId)).findFirst();
                
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Comment comment = commentOpt.get();
        // Ownership rules: Must be the author to edit
        if (!comment.getAuthorId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own comments.");
        }
        
        comment.setText(payload.get("text"));
        comment.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(comment);
    }
    
    // Serve file route
    @GetMapping("/attachments/{filename}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String filename) {
        File file = fileStorageService.getFile(filename);
        if(!file.exists()) {
             return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                // Can ideally detect content-type dynamically but defaults to binary download or image display
                // based on client logic for simplicity
                .body(new FileSystemResource(file));
    }
}
