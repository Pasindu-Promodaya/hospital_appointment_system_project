package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        if (specialty == null || specialty.isEmpty() || specialty.equalsIgnoreCase("All")) {
            return doctorRepository.findByIsActiveTrue();
        }
        return doctorRepository.findBySpecializationContainingIgnoreCaseAndIsActiveTrue(specialty);
    }

    // 3. Logic to save a new weekly shift roster entry with database context hydration
    public DoctorSchedule saveSchedule(DoctorSchedule schedule) {
        if (schedule == null || schedule.getDoctor() == null || schedule.getDoctor().getId() == null) {
            throw new RuntimeException("Cannot record schedule: Target Doctor identification data is missing.");
        }

        Long docId = schedule.getDoctor().getId();
        Doctor managedDoctor = doctorRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Doctor with ID " + docId + " not found in system storage."));

        schedule.setDoctor(managedDoctor);
        return scheduleRepository.save(schedule);
    }

    // 4. THE CORE ALGORITHM: Slices a time shift block into individual 15-minute intervals
    public List<LocalTime> generateAvailableSlots(Long scheduleId) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Requested schedule profile not found"));

        List<LocalTime> slots = new ArrayList<>();
        LocalTime currentTime = schedule.getStartTime();
        LocalTime endTime = schedule.getEndTime();
        int duration = schedule.getSlotDurationMinutes();

        while (currentTime.plusMinutes(duration).isBefore(endTime) || currentTime.plusMinutes(duration).equals(endTime)) {
            slots.add(currentTime);
            currentTime = currentTime.plusMinutes(duration);
        }

        return slots;
    }

    // 🎯 5. DECOUPLED QUEUE ENGINE: Validates IDs via DoctorRepository directly
    // This allows your frontend React workspace view to load real dummy records perfectly without needing your teammate's repo!
    public List<Map<String, Object>> getTodayQueue(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Practitioner tracking sequence ID " + doctorId + " does not exist.");
        }
        
        List<Map<String, Object>> liveQueue = new ArrayList<>();
        
        // 🧪 Safe diagnostic mock tracking payloads matching your UI properties
        Map<String, Object> diagnosticPatient = new HashMap<>();
        diagnosticPatient.put("id", 1L);
        diagnosticPatient.put("ticket", "TKN-001");
        diagnosticPatient.put("name", "John Doe");
        diagnosticPatient.put("time", "09:00 AM");
        diagnosticPatient.put("status", "serving");
        diagnosticPatient.put("phone", "+94 77 123 4567");
        diagnosticPatient.put("email", "johndoe@example.com");
        diagnosticPatient.put("reason", "Frequent severe migraine checks and neurological baseline review.");
        
        liveQueue.add(diagnosticPatient);
        return liveQueue;
    }
}