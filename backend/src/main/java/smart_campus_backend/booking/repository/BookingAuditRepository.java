package smart_campus_backend.booking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.booking.entity.BookingAudit;

import java.util.List;

@Repository
public interface BookingAuditRepository extends MongoRepository<BookingAudit, String> {
    List<BookingAudit> findByBookingIdOrderByTimestampDesc(String bookingId);
}
