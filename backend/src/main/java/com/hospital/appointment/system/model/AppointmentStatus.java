package com.hospital.appointment.system.model;

public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    WAITING,
    CALLED,       // 🎯 MUST be CALLED
    COMPLETED,    // 🎯 MUST be COMPLETED
    CANCELLED
}