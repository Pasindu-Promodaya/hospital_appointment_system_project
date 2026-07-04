package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);

    @Query(value = "SELECT DISTINCT specialization FROM doctors WHERE specialization IS NOT NULL AND is_active = true", nativeQuery = true)
    List<String> findDistinctSpecializations();

    @Query(value = "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM doctors WHERE specialization = :specialization AND is_active = true", nativeQuery = true)
    List<Object[]> findDoctorsBySpecialization(@Param("specialization") String specialization);

    // Added UPPER() conversion to secure weekday matching across different DB engines
    @Query(value = "SELECT start_time, end_time, slot_duration_minutes FROM doctor_schedules WHERE doctor_id = :doctorId AND UPPER(day_of_week) = UPPER(:dayOfWeek) LIMIT 1", nativeQuery = true)
    List<Object[]> findDoctorScheduleByDay(@Param("doctorId") Long doctorId, @Param("dayOfWeek") String dayOfWeek);

    // Switched return type to Object to handle raw database driver TIME types safely
    @Query(value = "SELECT time_slot FROM appointments WHERE doctor_id = :doctorId AND appointment_date = :date AND status != 'CANCELLED'", nativeQuery = true)
    List<Object> findBookedSlotsByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // Getting appointment details from appointments and doctors tables.
    @Query(value = "SELECT a.id, a.doctor_id, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, " +
                   "d.specialization, a.appointment_date, a.time_slot, a.token_number, a.queue_order, " +
                   "a.status, a.medical_problem " +
                   "FROM appointments a " +
                   "JOIN doctors d ON a.doctor_id = d.id " +
                   "WHERE a.patient_id = :patientId ORDER BY a.appointment_date DESC, a.time_slot DESC", nativeQuery = true)
    List<Object[]> findAppointmentsWithDoctorDetails(@Param("patientId") Long patientId);

    // 🎯 FIXED: Joined the 'patients' table instead of 'users' to grab the real personal profile fields
    @Query(value = "SELECT a.id, a.token_number, CONCAT(p.first_name, ' ', p.last_name) AS patient_name, a.appointment_date, " +
                   "a.time_slot, a.status, a.medical_problem, p.phone AS patient_phone, p.email AS patient_email " +
                   "FROM appointments a " +
                   "JOIN patients p ON a.patient_id = p.id " +
                   "WHERE a.doctor_id = :doctorId AND a.appointment_date = :date " +
                   "ORDER BY a.time_slot ASC", nativeQuery = true)
    List<Object[]> findTodayQueueByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}