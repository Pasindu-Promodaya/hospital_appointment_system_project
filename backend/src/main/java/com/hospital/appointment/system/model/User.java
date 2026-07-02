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

    // 🎯 INTEGRATED: Uses your teammate's column name 'password_hash' but keeps your variable name 'password' 
    // to prevent breaking your code elsewhere in the application layer!
    @Column(name = "password_hash", nullable = false)
    private String password; 

    @Column(nullable = false)
    private String role; // Holds descriptive tag strings (e.g., ROLE_PATIENT, ROLE_DOCTOR)

    // 🧑‍💻 TEAMMATE'S PROPERTY: Automatically sets tracking timestamps upon database insert rows
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * ⛓️ YOUR DOCTOR GRAPH: Optional Bidirectional One-to-One mapping linking down to the doctor metadata table.
     * Jackson loop-protection is preserved via @JsonBackReference.
     */
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "user")
    @JsonBackReference
    private Doctor doctor;

    // --- Constructors ---
    
    // 💡 Empty constructor required by Hibernate Reflection API
    public User() {}

    // 🧑‍💻 Parameterized constructor for registration flows
    public User(String email, String password, String role, Doctor doctor) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.doctor = doctor;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Unified helper syntax mapping to prevent breaking your project files
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Teammate aliased getter/setter support hooks to ensure patient profiles match perfectly
    public String getPasswordHash() { return password; }
    public void setPasswordHash(String passwordHash) { this.password = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
}