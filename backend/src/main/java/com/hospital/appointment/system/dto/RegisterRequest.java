package com.hospital.appointment.system.dto;

public class RegisterRequest {
    
    // Ensure these match your React frontend state object keys exactly
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String phone;
    private String sex;
    private String role; // Optional: Pass this if you want to allow dynamic roles, otherwise set default in Service

    // --- GETTERS AND SETTERS ---

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}