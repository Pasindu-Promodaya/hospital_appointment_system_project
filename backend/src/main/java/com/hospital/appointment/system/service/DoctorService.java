package com.hospital.appointment.system.service;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.model.UserRole;
import com.hospital.appointment.system.repository.AppointmentRepository;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.ScheduleRepository;
import com.hospital.appointment.system.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    @Autowired
    private AppointmentRepository appointmentRepository; 

    // Inject the BCrypt Password Encoder configured in your Spring Security setup
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Doctor registerNewDoctor(DoctorRegisterDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already registered in the system!");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        
        // Hash the plaintext password from the DTO before saving it to the database
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        
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

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        if (specialty == null || specialty.isEmpty() || specialty.equalsIgnoreCase("All")) {
            return doctorRepository.findByActiveStatusTrue();
        }
        return doctorRepository.findBySpecializationContainingIgnoreCaseAndActiveStatusTrue(specialty);
    }

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
        diagnosticPatient.put("status", "CALLED"); // MUST BE CALLED
        diagnosticPatient.put("phone", "+94 77 123 4567");
        diagnosticPatient.put("email", "johndoe@example.com");
        diagnosticPatient.put("reason", "Frequent severe migraine checks and neurological baseline review.");

        liveQueue.add(diagnosticPatient);
        return liveQueue;
    }

    /**
     * 🎯 DASHBOARD NO-SHOW LOGIC
     */
    @Transactional
    public void cycleNoShowPatientToEnd(Long appointmentId) {
        Appointment missedPatient = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment record not found for ID: " + appointmentId));

        // MUST BE CALLED to match teammate's implementation
        if (missedPatient.getStatus() == AppointmentStatus.CALLED) {
            
            // Revert back to CONFIRMED
            missedPatient.setStatus(AppointmentStatus.CONFIRMED);

            // Push to max queue order
            Integer maxCurrentOrder = appointmentRepository.findMaxQueueOrderForDoctor(
                    missedPatient.getDoctorId(), LocalDate.now()
            );

            int newEndPosition = (maxCurrentOrder != null) ? maxCurrentOrder + 1 : 1;
            missedPatient.setQueueOrder(newEndPosition);

            appointmentRepository.save(missedPatient);
        }
    }
}