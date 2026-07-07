package com.hospital.appointment.system.dto;

import lombok.Data;

@Data // automatically creates ALL your getters and setters
public class RegisterRequest {
    
    // Ensure these match your React frontend state object keys exactly
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String phone;
    private String gender;     
    private String role; 
}