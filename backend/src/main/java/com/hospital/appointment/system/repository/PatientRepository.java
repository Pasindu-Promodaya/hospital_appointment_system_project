package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository 
    extends JpaRepository<Patient, Long> {

}