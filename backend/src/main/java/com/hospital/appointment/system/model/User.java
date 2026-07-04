package com.hospital.appointment.system.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    // 🎯 FIXED: Changed variable name to 'passwordHash' to align perfectly with Spring Data & Security models
    @Column(name = "password_hash", nullable = false)
    private String passwordHash; 

    @Column(nullable = false)
    private String role; 

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "user")
    @JsonBackReference
    private Doctor doctor;

    // --- Constructors ---
    public User() {}

    public User(String email, String passwordHash, String role, Doctor doctor) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.doctor = doctor;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // 🎯 INTEGRATION BRIDGE: Keeps standard getPassword() to satisfy Spring Security's UserDetails interface
    public String getPassword() { return this.passwordHash; }
    public void setPassword(String password) { this.passwordHash = password; }

    // 🎯 ALIASED HOOKS: Maps cleanly to teammate's requirements 
    public String getPasswordHash() { return this.passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
}