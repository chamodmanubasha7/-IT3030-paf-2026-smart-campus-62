package smart_campus_backend.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.auth.entity.Role;
import smart_campus_backend.auth.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    List<User> findByRoleAndEnabledTrueOrderByNameAsc(Role role);
}
