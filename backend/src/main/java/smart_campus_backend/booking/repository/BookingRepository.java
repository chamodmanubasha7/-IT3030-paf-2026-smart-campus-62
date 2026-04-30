package smart_campus_backend.booking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.booking.entity.Booking;
import smart_campus_backend.booking.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserOrderByDateDescStartTimeDesc(User user);

    List<Booking> findAllByOrderByDateDescStartTimeDesc();

    @Query(value = "{ 'resource.$id' : ?0, 'date' : ?1, 'status' : { $in : ?4 }, 'startTime' : { $lt : ?3 }, 'endTime' : { $gt : ?2 } }", count = true)
    Long countOverlappingBookings(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, List<BookingStatus> activeStatuses);

    default boolean existsOverlappingBooking(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, List<BookingStatus> activeStatuses) {
        return countOverlappingBookings(resourceId, date, startTime, endTime, activeStatuses) > 0;
    }

    @Query(value = "{ 'resource.$id' : ?0, 'date' : ?1, 'status' : { $in : ?5 }, 'id' : { $ne : ?4 }, 'startTime' : { $lt : ?3 }, 'endTime' : { $gt : ?2 } }", count = true)
    Long countOverlappingBookingsExcluding(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String excludeBookingId, List<BookingStatus> activeStatuses);

    default boolean existsOverlappingBookingExcluding(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String excludeBookingId, List<BookingStatus> activeStatuses) {
        return countOverlappingBookingsExcluding(resourceId, date, startTime, endTime, excludeBookingId, activeStatuses) > 0;
    }

    // Summing attendees is harder in simple @Query, might need aggregation.
    // For now, I'll return the list and sum in service if needed, or keep it as is if it's not used everywhere.
    // But I'll try to provide a basic aggregation if I can.
    // However, to keep it simple and compatible with existing service calls:
    @Query(value = "{ 'resource.$id' : ?0, 'date' : ?1, 'status' : { $in : ?4 }, 'startTime' : { $lt : ?3 }, 'endTime' : { $gt : ?2 } }")
    List<Booking> findOverlappingBookings(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, List<BookingStatus> countableStatuses);

    @Query(value = "{ 'resource.$id' : ?0, 'date' : ?1, 'status' : { $in : ?5 }, 'id' : { $ne : ?4 }, 'startTime' : { $lt : ?3 }, 'endTime' : { $gt : ?2 } }")
    List<Booking> findOverlappingBookingsExcluding(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String excludeBookingId, List<BookingStatus> countableStatuses);

    @Query(value = "{ 'resource.$id' : ?0, 'date' : ?1, 'status' : ?4, 'startTime' : { $lt : ?3 }, 'endTime' : { $gt : ?2 } }", sort = "{ 'waitlistedAt' : 1, 'createdAt' : 1, 'id' : 1 }")
    List<Booking> findWaitlistedOverlappingBookingsFifo(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, BookingStatus waitlistStatus);
}
