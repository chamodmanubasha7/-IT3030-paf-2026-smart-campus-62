package smart_campus_backend.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smart_campus_backend.booking.dto.BookingAnalyticsResponse;
import smart_campus_backend.booking.repository.BookingRepository;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingAnalyticsService {

        private final BookingRepository bookingRepository;

        public BookingAnalyticsResponse getBookingAnalytics() {
                var allBookings = bookingRepository.findAll();
                long total = allBookings.size();

                Map<String, Long> resourceUsage = allBookings.stream()
                                .filter(b -> b.getResource() != null)
                                .collect(java.util.stream.Collectors.groupingBy(
                                                b -> b.getResource().getName() != null ? b.getResource().getName()
                                                                : "Unknown",
                                                java.util.stream.Collectors.counting()));

                Map<Integer, Long> hourUsage = allBookings.stream()
                                .filter(b -> b.getStartTime() != null)
                                .collect(java.util.stream.Collectors.groupingBy(
                                                b -> b.getStartTime().getHour(),
                                                java.util.stream.Collectors.counting()));

                return BookingAnalyticsResponse.builder()
                                .totalBookings(total)
                                .bookingsByResource(resourceUsage)
                                .bookingsByHour(hourUsage)
                                .build();
        }
}
