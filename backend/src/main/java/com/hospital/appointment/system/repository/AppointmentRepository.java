package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Fetch active queue for a doctor ordered chronologically by the queue order
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(
            Long doctorId, LocalDate date, AppointmentStatus status);

    // Find a specific active appointment matching doctor, date, and status constraints
    Optional<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            Long doctorId, LocalDate date, AppointmentStatus status);

    // Fetch all active consultations to clear out legacy records regardless of date
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    // Count the total number of bookings registered under a specific doctor for a given date
    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    // Custom query to identify the highest position index to re-queue no-show patients
    @Query("SELECT MAX(a.queueOrder) FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate = :date")
    Integer findMaxQueueOrderForDoctor(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // Retrieve historical appointment records mapped to a specific patient ID
    List<Appointment> findByPatientId(Long patientId);

    // Native query to fetch distinct clinical specialization tags from active doctors
    @Query(value = "SELECT DISTINCT specialization FROM doctors WHERE specialization IS NOT NULL AND is_active = true", nativeQuery = true)
    List<String> findDistinctSpecializations();

    // Native query to pull doctor list filtered by specialized medical department tracks
    @Query(value = "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM doctors WHERE specialization = :specialization AND is_active = true", nativeQuery = true)
    List<Object[]> findDoctorsBySpecialization(@Param("specialization") String specialization);

    // Native query to fetch standard roster shift timings configured for the physician
    @Query(value = "SELECT start_time, end_time FROM doctor_schedules WHERE doctor_id = :doctorId AND UPPER(day_of_week) = UPPER(:dayOfWeek) LIMIT 1", nativeQuery = true)
    List<Object[]> findDoctorScheduleByDay(@Param("doctorId") Long doctorId, @Param("dayOfWeek") String dayOfWeek);

    // Native query to extract booked time blocks to avoid scheduling conflicts on identical slots
    @Query(value = "SELECT time_slot FROM appointments WHERE doctor_id = :doctorId AND appointment_date = :date AND status != 'CANCELLED'", nativeQuery = true)
    List<Object> findBookedSlotsByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // Native query providing composite inner join profiles matching patient history matrices
    @Query(value = "SELECT a.id, a.doctor_id, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, " +
            "d.specialization, a.appointment_date, a.time_slot, a.token_number, a.queue_order, " +
            "a.status, a.medical_problem " +
            "FROM appointments a " +
            "JOIN doctors d ON a.doctor_id = d.id " +
            "WHERE a.patient_id = :patientId ORDER BY a.appointment_date DESC, a.time_slot DESC", nativeQuery = true)
    List<Object[]> findAppointmentsWithDoctorDetails(@Param("patientId") Long patientId);

    // Comprehensive query evaluating today's total active queue with attached patient contacts
    @Query(value = "SELECT a.id, a.token_number, a.patient_name, a.appointment_date, " +
            "a.time_slot, a.status, a.medical_problem, p.phone AS patient_phone, p.email AS patient_email " +
            "FROM appointments a " +
            "JOIN patients p ON a.patient_id = p.id " +
            "WHERE a.doctor_id = :doctorId AND a.appointment_date = :date " +
            "ORDER BY a.queue_order ASC", nativeQuery = true)
    List<Object[]> findTodayQueueByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // Native aggregation mechanism capturing exact completed transaction updates for dashboard KPI
    @Query(value = "SELECT COUNT(*) FROM appointments WHERE doctor_id = :doctorId AND appointment_date = :date AND status = 'COMPLETED'", nativeQuery = true)
    long countServedTodayByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}