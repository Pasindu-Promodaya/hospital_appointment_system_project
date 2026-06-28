package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    //Auto genarates select all from where specalization and is active

    List<Doctor> findBySpecializationAndIsActiveTrue(String specialization);

    //Auto genarates Select all from where is active

    List<Doctor> findByIsActiveTrue();
}
