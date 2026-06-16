package com.hospital.appoointment.system.repository;

import com.hospital.appointment.system.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;   
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorId(Long doctorId);
}