package smart_campus_backend.booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.auth.repository.UserRepository;
import smart_campus_backend.booking.dto.ApproveBookingRequest;
import smart_campus_backend.booking.dto.BookingAvailabilityResponse;
import smart_campus_backend.booking.dto.BookingRequest;
import smart_campus_backend.booking.dto.BookingResponse;
import smart_campus_backend.booking.dto.RejectBookingRequest;
import smart_campus_backend.booking.entity.BookingAudit;
import smart_campus_backend.booking.service.BookingService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN')")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserByEmail(userDetails);
        return new ResponseEntity<>(bookingService.createBooking(request, user), HttpStatus.CREATED);
    }

    @GetMapping("/availability")
    public ResponseEntity<BookingAvailabilityResponse> getAvailability(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime
    ) {
        return ResponseEntity.ok(bookingService.getAvailability(resourceId, date, startTime, endTime));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) ApproveBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User adminUser = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.approveBooking(id, request, adminUser));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody RejectBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User adminUser = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.rejectBooking(id, request.getReason(), adminUser));
    }

    @PutMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BookingResponse> revokeApproval(
            @PathVariable String id,
            @Valid @RequestBody RejectBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User adminUser = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.revokeApproval(id, request.getReason(), adminUser));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<BookingAudit>> getBookingHistory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserByEmail(userDetails);
        return ResponseEntity.ok(bookingService.getBookingHistory(id, user));
    }

    private User getUserByEmail(UserDetails userDetails) {
        if (userDetails == null) {
            throw new UsernameNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found"));
    }
}
