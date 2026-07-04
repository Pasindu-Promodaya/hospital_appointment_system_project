package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Find active doctors by specialization with case-insensitive search
    List<Doctor> findBySpecializationContainingIgnoreCaseAndIsActiveTrue(String specialization);

    // Find all active doctors
    List<Doctor> findByIsActiveTrue();
}