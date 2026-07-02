package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 🔍 Custom query method to look up system accounts by their unique email address string
    Optional<User> findByEmail(String email);
}