package smart_campus_backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import smart_campus_backend.auth.dto.UserManagementUserResponse;
import smart_campus_backend.auth.entity.Role;
import smart_campus_backend.auth.entity.User;
import smart_campus_backend.auth.repository.UserRepository;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserRepository userRepository;

    public List<UserManagementUserResponse> listUsers(String role, String status, String search) {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        
        return users.stream()
                .filter(u -> {
                    if (role != null && !role.isBlank()) {
                        return normalizeRole(role).equals(u.getRole());
                    }
                    return true;
                })
                .filter(u -> {
                    if (status != null && !status.isBlank()) {
                        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
                        if ("ACTIVE".equals(normalizedStatus)) {
                            return u.isEnabled();
                        } else if ("BANNED".equals(normalizedStatus)) {
                            return !u.isEnabled();
                        }
                    }
                    return true;
                })
                .filter(u -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase(Locale.ROOT);
                        return (u.getName() != null && u.getName().toLowerCase().contains(s))
                                || (u.getEmail() != null && u.getEmail().toLowerCase().contains(s));
                    }
                    return true;
                })
                .map(this::toResponse)
                .toList();
    }

    public UserManagementUserResponse updateUserRole(String id, String requestedRole, Authentication authentication) {
        User targetUser = getUser(id);
        Role normalizedRole = normalizeRole(requestedRole);

        protectLastSuperAdminRoleChange(targetUser, normalizedRole);
        protectSelfRoleChange(authentication, targetUser);

        targetUser.setRole(normalizedRole);
        return toResponse(userRepository.save(targetUser));
    }

    public UserManagementUserResponse updateUserBanStatus(String id, boolean banned, Authentication authentication) {
        User targetUser = getUser(id);
        protectSelfChange(authentication, targetUser);

        if (isSuperAdmin(targetUser) && banned) {
            long superAdminCount = userRepository.countByRole(Role.SUPER_ADMIN);
            if (superAdminCount <= 1) {
                throw new RuntimeException("Cannot ban the last SUPER_ADMIN");
            }
        }

        targetUser.setEnabled(!banned);
        return toResponse(userRepository.save(targetUser));
    }

    public void deleteUser(String id, Authentication authentication) {
        User targetUser = getUser(id);
        protectSelfChange(authentication, targetUser);

        if (isSuperAdmin(targetUser)) {
            long superAdminCount = userRepository.countByRole(Role.SUPER_ADMIN);
            if (superAdminCount <= 1) {
                throw new RuntimeException("Cannot delete the last SUPER_ADMIN");
            }
        }

        userRepository.delete(targetUser);
    }

    private User getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserManagementUserResponse toResponse(User user) {
        return UserManagementUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() == null ? Role.USER.name() : user.getRole().name())
                .enabled(user.isEnabled())
                .build();
    }

    private Role normalizeRole(String role) {
        return Role.fromStoredValue(role);
    }

    private boolean isSuperAdmin(User user) {
        return Role.SUPER_ADMIN.equals(user.getRole());
    }

    private void protectSelfChange(Authentication authentication, User targetUser) {
        String currentUserEmail = authentication.getName();
        if (currentUserEmail.equalsIgnoreCase(targetUser.getEmail())) {
            throw new RuntimeException("You cannot modify your own account with this action");
        }
    }

    private void protectSelfRoleChange(Authentication authentication, User targetUser) {
        String currentUserEmail = authentication.getName();
        if (currentUserEmail.equalsIgnoreCase(targetUser.getEmail())) {
            throw new RuntimeException("You cannot change your own role");
        }
    }

    private void protectLastSuperAdminRoleChange(User targetUser, Role nextRole) {
        if (isSuperAdmin(targetUser) && !Role.SUPER_ADMIN.equals(nextRole)) {
            long superAdminCount = userRepository.countByRole(Role.SUPER_ADMIN);
            if (superAdminCount <= 1) {
                throw new RuntimeException("Cannot downgrade the last SUPER_ADMIN");
            }
        }
    }
}
