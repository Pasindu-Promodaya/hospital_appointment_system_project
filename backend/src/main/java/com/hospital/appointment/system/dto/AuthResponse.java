package com.hospital.appointment.system.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long doctorId; // Will return the linked doctor's ID if the user is a doctor

    public AuthResponse(String token, String email, String role, Long doctorId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.doctorId = doctorId;
    }

    // --- Getters and Setters ---
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}