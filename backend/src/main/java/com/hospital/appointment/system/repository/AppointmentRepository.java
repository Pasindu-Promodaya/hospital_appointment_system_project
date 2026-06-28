package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // get all pending appointments for specific doctor on today, ordered by queue sequence
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(
            Long doctorId, LocalDate date, AppointmentStatus status);

    // get the current active patient inside the doctor's room
    Optional<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            Long doctorId, LocalDate date, AppointmentStatus status);

    // count total appointments for  doctor today to calculate the next token number
    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);
}