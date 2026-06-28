package com.hospital.appointment.system.dto;

public class LoginResponse {
    private Long id;
    private String email;
    private String role;
    private String message;

    public LoginResponse(Long id, String email, String role, String message) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.message = message;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}