package com.hospital.appointment.system.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // 🚀 CRITICAL FIX: Keeping your clean Type-safe Enum mapping
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Bidirectional link from main branch to access Doctor profile from User cleanly
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "user")
    @JsonBackReference
    private Doctor doctor;

    // Constructors
    public User() {}

    public User(String email, String passwordHash, UserRole role, Doctor doctor) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.doctor = doctor;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // 🎯 INTEGRATION BRIDGE: Satisfies standard Spring Security interface requirements
    public String getPassword() { return this.passwordHash; }
    public void setPassword(String password) { this.passwordHash = password; }

    public String getPasswordHash() { return this.passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    // 🎯 COMPATIBILITY HOOK: If teammate's code passes role as String somewhere, this converts it safely
    public String getRoleAsString() {
        return role != null ? role.name() : null;
    }
}