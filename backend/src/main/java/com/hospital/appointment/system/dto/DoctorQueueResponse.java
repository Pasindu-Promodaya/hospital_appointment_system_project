package com.hospital.appointment.system.dto;

import java.time.LocalDate;

public class DoctorQueueResponse {
    private Long id;
    private String ticket;
    private int tokenNumber;
    private String patientName;
    private String name; // Frontend fallback match
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String time; // Frontend fallback match
    private String status;
    private String medicalProblem;
    private String reason; // Frontend fallback match
    private String patientPhone;
    private String patientEmail;

    public DoctorQueueResponse(Long id, int tokenNumber, String patientName, 
                               LocalDate appointmentDate, String appointmentTime, 
                               String status, String medicalProblem, 
                               String patientPhone, String patientEmail) {
        this.id = id;
        this.tokenNumber = tokenNumber;
        this.ticket = "TKN-" + String.format("%03d", tokenNumber);
        this.patientName = patientName;
        this.name = patientName;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.time = appointmentTime;
        this.status = status;
        this.medicalProblem = medicalProblem != null ? medicalProblem : "General Consultation";
        this.reason = this.medicalProblem;
        this.patientPhone = patientPhone != null ? patientPhone : "Not Provided";
        this.patientEmail = patientEmail != null ? patientEmail : "Not Provided";
    }

    // Getters 
    public Long getId() { return id; }
    public String getTicket() { return ticket; }
    public int getTokenNumber() { return tokenNumber; }
    public String getPatientName() { return patientName; }
    public String getName() { return name; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getTime() { return time; }
    public String getStatus() { return status; }
    public String getMedicalProblem() { return medicalProblem; }
    public String getReason() { return reason; }
    public String getPatientPhone() { return patientPhone; }
    public String getPatientEmail() { return patientEmail; }
}