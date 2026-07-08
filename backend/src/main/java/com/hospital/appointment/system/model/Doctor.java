package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// Ignore Hibernate lazy loading proxy properties during JSON serialization
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link doctor with user account using lazy fetching
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

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String availability = "Available";

    // Track active status of the doctor profile
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

    // Constructor for creating a doctor profile manually
    public Doctor(User user, String firstName, String lastName, String email, String telephoneNumber,
                  String specialization, String licenseNumber, Boolean activeStatus, Long createdByAdminId) {
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = "Dr. " + firstName + " " + lastName;
        this.email = email;
        this.telephoneNumber = telephoneNumber;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.activeStatus = activeStatus;
        this.createdByAdminId = createdByAdminId;
    }

    // Helper getters and setters for compatibility
    public Boolean getIsActive() {
        return this.activeStatus;
    }

    public void setIsActive(Boolean isActive) {
        this.activeStatus = isActive;
    }
}