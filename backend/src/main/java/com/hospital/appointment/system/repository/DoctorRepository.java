package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // 🌟 Uses ContainingIgnoreCase to make the search case-insensitive and safe against spacing bugs
    List<Doctor> findBySpecializationContainingIgnoreCaseAndIsActiveTrue(String specialization);

    // Automatically generates: SELECT * FROM doctors WHERE is_active = 1
    List<Doctor> findByIsActiveTrue();
}