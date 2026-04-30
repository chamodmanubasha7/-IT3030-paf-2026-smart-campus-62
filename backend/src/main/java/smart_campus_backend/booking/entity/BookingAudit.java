package smart_campus_backend.booking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "booking_audits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAudit {

    @Id
    private String id;

    @DBRef
    private Booking booking;

    private BookingStatus status;

    private String action;

    private String performedBy;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
