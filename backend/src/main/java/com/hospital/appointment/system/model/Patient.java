package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "patients")
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId; 

    private LocalDate dateOfBirth;
    private String bloodType;
    
    @Column(columnDefinition = "TEXT")
    private String knownDrugAllergies;
    
    @Column(columnDefinition = "TEXT")
    private String chronicConditions;
    
    private String emergencyContactDetails;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference 
    private List<MedicalNote> medicalNotes;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String getKnownDrugAllergies() { return knownDrugAllergies; }
    public void setKnownDrugAllergies(String knownDrugAllergies) { this.knownDrugAllergies = knownDrugAllergies; }

    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }

    public String getEmergencyContactDetails() { return emergencyContactDetails; }
    public void setEmergencyContactDetails(String emergencyContactDetails) { this.emergencyContactDetails = emergencyContactDetails; }

    public List<MedicalNote> getMedicalNotes() { return medicalNotes; }
    public void setMedicalNotes(List<MedicalNote> medicalNotes) { this.medicalNotes = medicalNotes; }
}