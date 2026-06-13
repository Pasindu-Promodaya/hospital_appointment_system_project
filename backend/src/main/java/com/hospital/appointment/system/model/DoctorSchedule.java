package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_schedules")
public class DoctorSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // many doc schedules have one doctor
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "day_of_week", nullable = false
)
    private String dayOfWeek;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_duration_minutes", nullable = false)
    private int slotDurationMinutes = 15;

    // Getters and Setters
    public Long getId() { return id;}
    public void setId(Long id) {this.id = id;}

    public Doctor getDoctor() { return doctor;}
    public void setDoctor(Doctor doctor) {this.doctor = doctor;} 

    public String getDayOfWeek() { return dayOfWeek;}
    public void setDayOfWeek(String dayOfWeek) {this.dayOfWeek = dayOfWeek;}

    public LocalTime getStartTime() { return startTime;}
    public void setStartTime(LocalTime startTime) {this.startTime = startTime;}

    public LocalTime getEndTime() { return endTime;}
    public void setEndTime(LocalTime endTime) {this.endTime = endTime;}

    public int getSlotDurationMinutes() { return slotDurationMinutes;}
    public void setSlotDurationMinutes(int slotDurationMinutes) {this.slotDurationMinutes = slotDurationMinutes;}

}