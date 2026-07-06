package com.hospital.appointment.system.model;

public enum UserRole {
    DOCTOR,
    PATIENT,
    ADMIN,
    // Add these so the backend stops crashing when it reads the database!
    ROLE_DOCTOR,
    ROLE_PATIENT,
    ROLE_ADMIN
}