package com.hospital.appointment.system.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

   
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(unique = true, nullable = false)
    private String email;

    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

   
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "user")
    @JsonBackReference
    private Doctor doctor;

    
    public User() {}

    
    public User(String email, String passwordHash, UserRole role, Doctor doctor) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.doctor = doctor;
    }

    // Lifecycle hook triggered automatically prior to running SQL persist insertions
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // Lifecycle hook triggered automatically prior to running SQL record modifications
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Standard structural Getters and Setters access encapsulation definitions
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Interoperability hook to provide abstract spring security authentication matching
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

    // Utility conversion mechanism to output standard Enum labels to basic text formats
    public String getRoleAsString() {
        return role != null ? role.name() : null;
    }
}