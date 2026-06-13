package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(name ="is_active", nullable = false)
    private boolean isActive = true;

    public Long getId() { return id;}
    public void setId(Long id) {this.id = id;}

    public String getName() { return name;}
    public void setName(String name) {this.name = name;}

    public String getSpecialization() { return specialization;} 
    public void setSpecialization(String specialization) {this.specialization = specialization;}

    public String getLicenseNumber() { return licenseNumber;}
    public void setLicenseNumber(String licenseNumber) {this.licenseNumber = licenseNumber;}
    
    public boolean isActive() { return isActive;}
    public void setActive(boolean isActive) {this.isActive = isActive;}
}