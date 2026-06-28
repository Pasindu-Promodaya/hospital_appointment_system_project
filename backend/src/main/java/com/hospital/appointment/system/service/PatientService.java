package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient updatePatient(Long userId, Patient patientDetails) {
        Patient existingPatient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient record not found for user ID: " + userId));

        existingPatient.setFirstName(patientDetails.getFirstName());
        existingPatient.setLastName(patientDetails.getLastName());
        existingPatient.setPhone(patientDetails.getPhone());
        existingPatient.setSex(patientDetails.getSex());
        existingPatient.setBloodType(patientDetails.getBloodType());
        existingPatient.setChronicConditions(patientDetails.getChronicConditions());
        existingPatient.setKnownDrugAllergies(patientDetails.getKnownDrugAllergies());
        existingPatient.setEmergencyContactDetails(patientDetails.getEmergencyContactDetails());
        existingPatient.setDateOfBirth(patientDetails.getDateOfBirth());
        existingPatient.setEmail(patientDetails.getEmail());

        return patientRepository.save(existingPatient);
    }
}