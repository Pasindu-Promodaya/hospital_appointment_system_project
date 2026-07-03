package com.hospital.appointment.system.dto;

import java.time.LocalDate;

public class AppointmentDetailsResponse {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate appointmentDate;
    private String timeSlot;
    private int tokenNumber;
    private int queueOrder;
    private String status;
    private String medicalProblem;

    public AppointmentDetailsResponse(Long id, Long doctorId, String doctorName, String specialization, 
                                      LocalDate appointmentDate, String timeSlot, int tokenNumber, 
                                      int queueOrder, String status, String medicalProblem) {
        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.appointmentDate = appointmentDate;
        this.timeSlot = timeSlot;
        this.tokenNumber = tokenNumber;
        this.queueOrder = queueOrder;
        this.status = status;
        this.medicalProblem = medicalProblem;
    }

    // Getters
    public Long getId() { return id; }
    public Long getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public String getSpecialization() { return specialization; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public String getTimeSlot() { return timeSlot; }
    public int getTokenNumber() { return tokenNumber; }
    public int getQueueOrder() { return queueOrder; }
    public String getStatus() { return status; }
    public String getMedicalProblem() { return medicalProblem; }
}