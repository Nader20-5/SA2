package com.smartrent.user.repository;

import com.smartrent.user.model.Role;
import com.smartrent.user.model.User;
import com.smartrent.user.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Page<User> findByRoleAndStatus(Role role, UserStatus status, Pageable pageable);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    long countByRole(Role role);
    long countByStatus(UserStatus status);
    long countByRoleAndStatus(Role role, UserStatus status);
}
