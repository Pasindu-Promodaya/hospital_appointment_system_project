package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.DynamicUpdate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@DynamicUpdate // Optimizes database updates by only modifying changed columns
public class Appointment {

    // Primary key with auto-increment strategy
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign key reference to the patient
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    // Foreign key reference to the assigned doctor
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    // Stores the full name of the patient for quick lookup
    @Column(name = "patient_name", nullable = false)
    private String patientName;

    // The scheduled date for the medical appointment
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    // Standard starting time string identifier for the slot
    @Column(name = "time_slot", nullable = false)
    private LocalTime timeSlot;

    // Exact calculated operational time for the checkup session
    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    // Brief textual description of the patient's symptoms or issue
    @Column(name = "medical_problem", length = 255)
    private String medicalProblem;

    // Unique sequential token number issued to the patient for the day
    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    // Defines the exact processing order inside the live doctor queue
    @Column(name = "queue_order", nullable = false)
    private Integer queueOrder;

    // Current workflow lifecycle status mapped via custom Enumeration string
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    // Fields marked with @Transient to ignore schema mapping if columns are absent in DB table
    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;

    // Default no-argument constructor required by JPA specifications
    public Appointment() {}

    // System Getters and Setters definitions for data access encapsulation
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getTimeSlot() { return timeSlot; }
    public void setTimeSlot(LocalTime timeSlot) { this.timeSlot = timeSlot; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getMedicalProblem() { return medicalProblem; }
    public void setMedicalProblem(String medicalProblem) { this.medicalProblem = medicalProblem; }

    public Integer getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(Integer tokenNumber) { this.tokenNumber = tokenNumber; }

    public Integer getQueueOrder() { return queueOrder; }
    public void setQueueOrder(Integer queueOrder) { this.queueOrder = queueOrder; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}