package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find system accounts by their unique email address
    Optional<User> findByEmail(String email);
}