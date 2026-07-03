package com.hospital.appointment.system.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRequest {
    private Long doctorId;
    private LocalDate appointmentDate;
    private LocalTime timeSlot;
    private String medicalProblem;

    // Getters and Setters
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getTimeSlot() { return timeSlot; }
    public void setTimeSlot(LocalTime timeSlot) { this.timeSlot = timeSlot; }

    public String getMedicalProblem() { return medicalProblem; }
    public void setMedicalProblem(String medicalProblem) { this.medicalProblem = medicalProblem; }
}