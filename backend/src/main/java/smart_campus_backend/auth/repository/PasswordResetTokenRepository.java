package smart_campus_backend.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.auth.entity.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(String userId);
}
