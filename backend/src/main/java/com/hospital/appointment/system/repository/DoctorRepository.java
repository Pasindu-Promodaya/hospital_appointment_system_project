package com.hospital.appoointment.system.repository;

import com.hospital.appoointment.system.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.utill.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    //Auto genarates select all from where specalization and is active

    List<Doctor> findBySpecializationAndIsActiveTrue(String specialization);

    //Auto genarates Select all from where is active

    List<Doctor> findByIsActiveTrue();
}
