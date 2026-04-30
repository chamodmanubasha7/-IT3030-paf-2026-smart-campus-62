package smart_campus_backend.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.auth.entity.AdminInvite;

import java.util.Optional;

public interface AdminInviteRepository extends MongoRepository<AdminInvite, String> {
    Optional<AdminInvite> findByToken(String token);
}
