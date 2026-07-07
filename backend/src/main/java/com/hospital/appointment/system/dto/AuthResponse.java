package com.hospital.appointment.system.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long id; 
    private Long doctorId; 

    public AuthResponse(String token, String email, String role, Long id, Long doctorId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.id = id;
        this.doctorId = doctorId;
    }

    // Custom Getters and Setters for Role-Based Access Control
    // Expose patientId normally if it's a patient profile login
    public Long getPatientId() { 
        return "ROLE_PATIENT".equals(this.role) || "PATIENT".equals(this.role) ? this.doctorId : null; 
    }
    public void setPatientId(Long patientId) { 
        this.doctorId = patientId; 
    }

    // --- Standard Getters and Setters ---
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // Expose doctorId normally if it's a doctor profile login
    public Long getDoctorId() { 
        return "ROLE_DOCTOR".equals(this.role) || "DOCTOR".equals(this.role) ? doctorId : null; 
    }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}