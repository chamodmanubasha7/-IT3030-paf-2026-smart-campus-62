package smart_campus_backend.booking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.resource.entity.CampusResource;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private CampusResource resource;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    private String purpose;

    private Integer attendees;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String rejectionReason;

    @Builder.Default
    private Boolean capacityOverridden = false;

    private String overrideReason;

    private LocalDateTime waitlistedAt;

    private LocalDateTime promotedAt;

    private String lastActionBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
