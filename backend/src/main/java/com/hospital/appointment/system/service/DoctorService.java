package com.hospital.appointment.system.service;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.model.UserRole;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.ScheduleRepository;
import com.hospital.appointment.system.repository.UserRepository;
import jakarta.transaction.Transactional;
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
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    // Register a new medical practitioner and link their user credentials account
    @Transactional
    public Doctor registerNewDoctor(DoctorRegisterDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already registered in the system!");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        user.setRole(UserRole.DOCTOR);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setName(dto.getFirstName() + " " + dto.getLastName());
        doctor.setEmail(dto.getEmail());
        doctor.setTelephoneNumber(dto.getTelephoneNumber());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setSpecialty(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getLicenseNumber());
        doctor.setCreatedByAdminId(dto.getCreatedByAdminId());

        return doctorRepository.save(doctor);
    }

    // Fetch all registered doctors from system storage
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Save or update a doctor profile directly
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Fetch active doctors filtered by department specialty
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        if (specialty == null || specialty.isEmpty() || specialty.equalsIgnoreCase("All")) {
            return doctorRepository.findByIsActiveTrue();
        }
        return doctorRepository.findBySpecializationContainingIgnoreCaseAndIsActiveTrue(specialty);
    }

    // Save a new weekly shift roster entry
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

    // Generates available appointment time slots by splitting shift block intervals
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

    // Get mock data for today's live queue diagnostics matching UI specifications
    public List<Map<String, Object>> getTodayQueue(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Practitioner tracking sequence ID " + doctorId + " does not exist.");
        }

        List<Map<String, Object>> liveQueue = new ArrayList<>();

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