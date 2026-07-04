package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⛓️ Link with LAZY fetching and JSON reference protection
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonManagedReference
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "telephone_number")
    private String telephoneNumber;

    @Column(name = "specialization", nullable = false)
    private String specialization;

    @Column(name = "specialty", nullable = false)
    private String specialty;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String availability = "Available";

    // Renamed variable to bypass filter glitch + Boxed Boolean to accept nulls cleanly
    @Column(name = "is_active", nullable = false)
    private Boolean activeStatus = true;

    @Column(name = "created_by_admin_id")
    private Long createdByAdminId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Custom constructor for manual instantiation if needed in services/tests
    public Doctor(User user, String firstName, String lastName, String email, String telephoneNumber,
                  String specialization, String specialty, String licenseNumber, Boolean activeStatus, Long createdByAdminId) {
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = "Dr. " + firstName + " " + lastName;
        this.email = email;
        this.telephoneNumber = telephoneNumber;
        this.specialization = specialization;
        this.specialty = specialty;
        this.licenseNumber = licenseNumber;
        this.activeStatus = activeStatus;
        this.createdByAdminId = createdByAdminId;
    }

    // Explicit helper method for isActive configuration to support main branch compatibility
    public Boolean getIsActive() {
        return this.activeStatus;
    }

    public void setIsActive(Boolean isActive) {
        this.activeStatus = isActive;
    }
}