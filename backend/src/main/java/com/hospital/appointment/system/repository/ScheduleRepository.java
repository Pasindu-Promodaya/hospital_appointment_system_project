package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;   

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    
    List<DoctorSchedule> findByDoctorId(Long doctorId);

    // 🎯 ADDED "First" to prevent crashes if there are duplicate schedules
    Optional<DoctorSchedule> findFirstByDoctorIdAndDayOfWeek(Long doctorId, String dayOfWeek);
}