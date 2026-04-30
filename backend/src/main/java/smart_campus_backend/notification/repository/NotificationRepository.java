package smart_campus_backend.notification.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.notification.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserOrderByTimestampDesc(User user);
    long countByUserAndIsReadFalse(User user);
}
