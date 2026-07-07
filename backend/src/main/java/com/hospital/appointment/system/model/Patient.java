package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data                 //  Automatically creates ALL getters and setters
@NoArgsConstructor    //  Automatically creates the empty constructor
@AllArgsConstructor   //  Automatically creates the full constructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private String firstName;
    private String lastName;
    
    @Column(name = "gender")
    private String gender; 

    private String email;

    @Column(name = "phone")
    private String phone;

    private LocalDate dateOfBirth;
    private String bloodType;

    @Column(columnDefinition = "TEXT")
    private String knownDrugAllergies;

    @Column(columnDefinition = "TEXT")
    private String chronicConditions;

    private String emergencyContactDetails;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    
}