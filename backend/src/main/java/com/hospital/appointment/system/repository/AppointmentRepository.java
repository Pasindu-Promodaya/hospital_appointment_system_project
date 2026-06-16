package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Check whether a doctor is already booked for a specific date and time
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(
            Long doctorId,
            LocalDate appointmentDate,
            LocalTime appointmentTime
    );

    // Get appointments of a doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // Get appointments of a patient
    List<Appointment> findByPatientId(Long patientId);

}