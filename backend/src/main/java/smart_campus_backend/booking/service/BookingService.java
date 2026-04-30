package smart_campus_backend.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.booking.dto.ApproveBookingRequest;
import smart_campus_backend.booking.dto.BookingAvailabilityResponse;
import smart_campus_backend.booking.dto.BookingRequest;
import smart_campus_backend.booking.dto.BookingResponse;
import smart_campus_backend.booking.entity.Booking;
import smart_campus_backend.booking.entity.BookingStatus;
import smart_campus_backend.booking.entity.BookingAudit;
import smart_campus_backend.mail.NotificationEmailService;
import smart_campus_backend.notification.entity.NotificationType;
import smart_campus_backend.auth.entity.Role;
import smart_campus_backend.auth.repository.UserRepository;
import smart_campus_backend.booking.repository.BookingAuditRepository;
import smart_campus_backend.booking.repository.BookingRepository;
import smart_campus_backend.notification.service.NotificationService;
import smart_campus_backend.resource.entity.CampusResource;
import smart_campus_backend.resource.repository.CampusResourceRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final List<BookingStatus> CAPACITY_COUNTABLE_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
    private static final List<BookingStatus> APPROVAL_CAPACITY_STATUSES =
            List.of(BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final CampusResourceRepository resourceRepository;
    private final BookingAuditRepository auditRepository;
    private final NotificationService notificationService;
    private final NotificationEmailService notificationEmailService;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User user) {
        CampusResource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + request.getResourceId()));

        validateBookingRequest(request, resource);

        BookingAvailabilityResponse availability = getAvailability(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        boolean shouldWaitlist = request.getAttendees() > availability.getRemainingCapacity();

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(shouldWaitlist ? BookingStatus.WAITLISTED : BookingStatus.PENDING)
                .build();
        if (shouldWaitlist) {
            booking.setWaitlistedAt(LocalDateTime.now());
        }

        Booking saved = bookingRepository.save(booking);
        createAuditLog(saved, shouldWaitlist ? "WAITLISTED" : "CREATED", user.getName());
        if (shouldWaitlist) {
            notificationService.createNotification(
                    booking.getUser(),
                    "Your booking request for " + booking.getResource().getName() + " on " + booking.getDate()
                            + " has been added to the WAITLIST due to full capacity."
            );
        }
        
        // Notify Admins
        List<User> admins = userRepository.findByRoleAndEnabledTrueOrderByNameAsc(Role.ADMIN);
        List<User> superAdmins = userRepository.findByRoleAndEnabledTrueOrderByNameAsc(Role.SUPER_ADMIN);
        
        String adminMsg = "New booking request from " + user.getName() + " for " + booking.getResource().getName() + " on " + booking.getDate();
        admins.forEach(admin -> notificationService.createNotification(admin, adminMsg, NotificationType.BOOKING, "/dashboard?section=manage-bookings"));
        superAdmins.forEach(admin -> notificationService.createNotification(admin, adminMsg, NotificationType.BOOKING, "/dashboard?section=manage-bookings"));

        return mapToResponse(saved);
    }

    public BookingAvailabilityResponse getAvailability(String resourceId, java.time.LocalDate date, LocalTime startTime, LocalTime endTime) {
        CampusResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + resourceId));

        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("End time must be later than start time");
        }

        Integer totalCapacity = resource.getCapacity() == null ? 0 : resource.getCapacity();
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resourceId,
                date,
                startTime,
                endTime,
                CAPACITY_COUNTABLE_STATUSES
        );
        int safeUsed = overlapping.stream()
                .mapToInt(b -> b.getAttendees() != null ? b.getAttendees() : 0)
                .sum();
        int remaining = Math.max(totalCapacity - safeUsed, 0);

        return BookingAvailabilityResponse.builder()
                .resourceId(resourceId)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .totalCapacity(totalCapacity)
                .usedCapacity(safeUsed)
                .remainingCapacity(remaining)
                .available(remaining > 0)
                .countedStatuses(CAPACITY_COUNTABLE_STATUSES.stream().map(Enum::name).collect(Collectors.toList()))
                .build();
    }

    private void validateBookingRequest(BookingRequest request, CampusResource resource) {
        if (request.getStartTime() == null || request.getEndTime() == null || !request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time");
        }
        if (Boolean.FALSE.equals(resource.getAvailable()) || resource.getStatus() != smart_campus_backend.resource.entity.ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Selected resource is not available for booking");
        }
        if (request.getAttendees() > resource.getCapacity()) {
            throw new IllegalStateException("Attendees exceed resource maximum capacity (" + resource.getCapacity() + ")");
        }
    }

    private void createAuditLog(Booking booking, String action, String performedBy) {
        BookingAudit audit = BookingAudit.builder()
                .booking(booking)
                .status(booking.getStatus())
                .action(action)
                .performedBy(performedBy)
                .timestamp(LocalDateTime.now())
                .build();
        auditRepository.save(audit);
    }

    public List<BookingResponse> getMyBookings(User user) {
        return bookingRepository.findByUserOrderByDateDescStartTimeDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByDateDescStartTimeDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse approveBooking(String id, ApproveBookingRequest request, User adminUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new IllegalStateException("Booking is already approved");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.WAITLISTED) {
            throw new IllegalStateException("Only pending or waitlisted bookings can be approved");
        }

        List<Booking> overlapping = bookingRepository.findOverlappingBookingsExcluding(
                booking.getResource().getId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId(),
                APPROVAL_CAPACITY_STATUSES
        );
        int safeApprovedSeats = overlapping.stream()
                .mapToInt(b -> b.getAttendees() != null ? b.getAttendees() : 0)
                .sum();
        int remainingSeats = Math.max(booking.getResource().getCapacity() - safeApprovedSeats, 0);
        boolean forceOverride = request != null && Boolean.TRUE.equals(request.getForceOverride());
        String overrideReason = request == null ? null : request.getOverrideReason();
        boolean wouldExceedCapacity = booking.getAttendees() > remainingSeats;

        if (wouldExceedCapacity && !forceOverride) {
            throw new IllegalStateException(
                    "Cannot approve booking. Only " + remainingSeats + " seat(s) remaining in this slot."
            );
        }
        if (wouldExceedCapacity && forceOverride && (overrideReason == null || overrideReason.trim().isEmpty())) {
            throw new IllegalArgumentException("Override reason is required when approving over capacity");
        }

        boolean wasWaitlisted = booking.getStatus() == BookingStatus.WAITLISTED;
        booking.setStatus(BookingStatus.APPROVED);
        if (wasWaitlisted) {
            booking.setPromotedAt(LocalDateTime.now());
        }
        booking.setCapacityOverridden(wouldExceedCapacity && forceOverride);
        booking.setOverrideReason(wouldExceedCapacity && forceOverride ? overrideReason.trim() : null);
        booking.setLastActionBy(adminUser.getName());
        Booking saved = bookingRepository.save(booking);
        createAuditLog(saved, booking.getCapacityOverridden() ? "APPROVED_OVERRIDE" : "APPROVED", adminUser.getName());
        String message = "Your booking for " + booking.getResource().getName() + " on " + booking.getDate() + " has been APPROVED.";
        notificationService.createNotification(
                booking.getUser(),
                message,
                NotificationType.BOOKING,
                "/bookings/my"
        );
        notificationEmailService.sendNotificationEmail(
                booking.getUser().getEmail(),
                "Booking approved - Smart Campus",
                message + "\n\nOpen the app to view details."
        );
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(String id, String reason, User adminUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.WAITLISTED) {
            throw new IllegalStateException("Only pending or waitlisted bookings can be rejected");
        }

        boolean freedCapacity = booking.getStatus() == BookingStatus.PENDING;
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setLastActionBy(adminUser.getName());
        Booking saved = bookingRepository.save(booking);
        createAuditLog(saved, "REJECTED", adminUser.getName());
        String message = "Your booking for " + booking.getResource().getName() + " on " + booking.getDate()
                + " has been REJECTED. Reason: " + reason;
        notificationService.createNotification(
                booking.getUser(),
                message,
                NotificationType.BOOKING,
                "/bookings/my"
        );
        notificationEmailService.sendNotificationEmail(
                booking.getUser().getEmail(),
                "Booking rejected - Smart Campus",
                message + "\n\nOpen the app to view details."
        );
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse revokeApproval(String id, String reason, User adminUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only approved bookings can be revoked");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("A reason is required to revoke an approval");
        }

        booking.setStatus(BookingStatus.PENDING);
        booking.setRejectionReason(reason); // Store the reason here or use another field. Let's use rejectionReason for simplicity, or just keep it in Audit log.
        booking.setLastActionBy(adminUser.getName());
        Booking saved = bookingRepository.save(booking);
        
        createAuditLog(saved, "APPROVAL_REVOKED - Reason: " + reason, adminUser.getName());
        
        String message = "The approval for your booking on " + booking.getDate() + " has been REVOKED. Reason: " + reason;
        notificationService.createNotification(
                booking.getUser(),
                message,
                NotificationType.BOOKING,
                "/bookings/my"
        );
        notificationEmailService.sendNotificationEmail(
                booking.getUser().getEmail(),
                "Booking Approval Revoked - Smart Campus",
                message + "\n\nOpen the app to view details."
        );
        
        processWaitlistForSlot(booking.getResource().getId(), booking.getDate(), booking.getStartTime(), booking.getEndTime());
        
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(String id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Use check: user can only cancel their own bookings
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already in a terminal state");
        }

        boolean freedCapacity = booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED;
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setLastActionBy(user.getName());
        Booking saved = bookingRepository.save(booking);
        createAuditLog(saved, "CANCELLED", user.getName());
        String message = "Your booking for " + booking.getResource().getName() + " on " + booking.getDate() + " has been CANCELLED.";
        notificationService.createNotification(
                booking.getUser(),
                message,
                NotificationType.BOOKING,
                "/bookings/my"
        );
        notificationEmailService.sendNotificationEmail(
                booking.getUser().getEmail(),
                "Booking cancelled - Smart Campus",
                message + "\n\nOpen the app to view details."
        );
        if (freedCapacity) {
            processWaitlistForSlot(booking.getResource().getId(), booking.getDate(), booking.getStartTime(), booking.getEndTime());
        }
        return mapToResponse(saved);
    }

    public List<BookingAudit> getBookingHistory(String id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new IllegalStateException("You can only view history for your own bookings");
        }
        return auditRepository.findByBookingIdOrderByTimestampDesc(id);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceLocation(booking.getResource().getLocation())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .capacityOverridden(Boolean.TRUE.equals(booking.getCapacityOverridden()))
                .overrideReason(booking.getOverrideReason())
                .waitlistedAt(booking.getWaitlistedAt())
                .promotedAt(booking.getPromotedAt())
                .lastActionBy(booking.getLastActionBy())
                .build();
    }

    private void processWaitlistForSlot(String resourceId, java.time.LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> waitlisted = bookingRepository.findWaitlistedOverlappingBookingsFifo(
                resourceId,
                date,
                startTime,
                endTime,
                BookingStatus.WAITLISTED
        );

        for (Booking candidate : waitlisted) {
            List<Booking> overlapping = bookingRepository.findOverlappingBookingsExcluding(
                    candidate.getResource().getId(),
                    candidate.getDate(),
                    candidate.getStartTime(),
                    candidate.getEndTime(),
                    candidate.getId(),
                    CAPACITY_COUNTABLE_STATUSES
            );
            int usedSeats = overlapping.stream()
                    .mapToInt(b -> b.getAttendees() != null ? b.getAttendees() : 0)
                    .sum();
            int remainingSeats = Math.max(candidate.getResource().getCapacity() - usedSeats, 0);

            // Strict FIFO: stop promotion when first queued request cannot fit.
            if (candidate.getAttendees() > remainingSeats) {
                break;
            }

            candidate.setStatus(BookingStatus.APPROVED);
            candidate.setPromotedAt(LocalDateTime.now());
            Booking promoted = bookingRepository.save(candidate);
            createAuditLog(promoted, "PROMOTED_FROM_WAITLIST", "SYSTEM");
            notificationService.createNotification(
                    promoted.getUser(),
                    "Good news! Your waitlisted booking for " + promoted.getResource().getName() + " on "
                            + promoted.getDate() + " has been APPROVED."
            );
        }
    }
}
