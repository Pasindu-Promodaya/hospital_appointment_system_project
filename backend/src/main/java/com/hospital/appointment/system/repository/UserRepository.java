package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 🔍 This custom query lets us look up a user by their unique email string
    Optional<User> findByEmail(String email);
}