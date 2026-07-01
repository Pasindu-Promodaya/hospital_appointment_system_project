package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    // 1. Logic to save or update a medical practitioner's profile
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // 2. Logic to fetch active practitioners filtered safely by department specialty
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        // 🎯 If specialty is empty, null, or explicitly "All", return all active practitioners
        if (specialty == null || specialty.isEmpty() || specialty.equalsIgnoreCase("All")) {
            return doctorRepository.findByIsActiveTrue();
        }
        // Passes the parameter straight to the robust case-insensitive query handler
        return doctorRepository.findBySpecializationContainingIgnoreCaseAndIsActiveTrue(specialty);
    }

    // 3. Logic to save a new weekly shift roster entry
    public DoctorSchedule saveSchedule(DoctorSchedule schedule) {
        return scheduleRepository.save(schedule);
    }

    // 4. THE CORE ALGORITHM: Slices a time shift block into individual 15-minute intervals
    public List<LocalTime> generateAvailableSlots(Long scheduleId) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Requested schedule profile not found"));

        List<LocalTime> slots = new ArrayList<>();
        LocalTime currentTime = schedule.getStartTime();
        LocalTime endTime = schedule.getEndTime();
        int duration = schedule.getSlotDurationMinutes(); // Reads your 15-minute setting

        // Loop forward in time increments until the shift block ends
        while (currentTime.plusMinutes(duration).isBefore(endTime) || currentTime.plusMinutes(duration).equals(endTime)) {
            slots.add(currentTime);
            currentTime = currentTime.plusMinutes(duration); // Step forward by 15 minutes
        }

        return slots;
    }
}