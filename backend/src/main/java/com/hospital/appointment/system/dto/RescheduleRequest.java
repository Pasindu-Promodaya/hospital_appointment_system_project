package com.hospital.appointment.system.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleRequest {
    private LocalDate newDate;
    private LocalTime newTimeSlot;

    // Getters and setters.
    public LocalDate getNewDate() { return newDate; }
    public void setNewDate(LocalDate newDate) { this.newDate = newDate; }

    public LocalTime getNewTimeSlot() { return newTimeSlot; }
    public void setNewTimeSlot(LocalTime newTimeSlot) { this.newTimeSlot = newTimeSlot; }
}