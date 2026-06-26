package com.hospital.appointment.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // Holds the secure BCrypt hashed string

    @Column(nullable = false)
    private String role; // Standard Values: ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN

    /**
     * Optional One-to-One mapping linking directly to the doctor profile table.
     * This ensures that when you log in as a Doctor, your user account knows exactly 
     * which Doctor ID belongs to you so your dashboard can load your specific queue.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = true)
    private Doctor doctor;

    // --- Constructors ---
    
    // 💡 Empty constructor required by Hibernate Reflection API
    public User() {}

    // 🧑‍💻 Parameterized constructor for clean programmatic registrations
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
}