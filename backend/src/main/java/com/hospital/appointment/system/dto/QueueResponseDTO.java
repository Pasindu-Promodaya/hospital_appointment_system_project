package com.hospital.appointment.system.dto;

import com.hospital.appointment.system.model.Appointment;
import java.util.List;

public class QueueResponseDTO {
    private String activeToken;
    private String activePatientName;
    private int waitingCount;
    private int servedTodayCount;
    private String averageConsultationTime;
    private List<Appointment> tableRecords;
    private List<String> recentAuditLogs;

    public QueueResponseDTO() {
    }

    public QueueResponseDTO(String activeToken, String activePatientName, int waitingCount,
                            int servedTodayCount, String averageConsultationTime,
                            List<Appointment> tableRecords, List<String> recentAuditLogs) {
        this.activeToken = activeToken;
        this.activePatientName = activePatientName;
        this.waitingCount = waitingCount;
        this.servedTodayCount = servedTodayCount;
        this.averageConsultationTime = averageConsultationTime;
        this.tableRecords = tableRecords;
        this.recentAuditLogs = recentAuditLogs;
    }

    public String getActiveToken() { return activeToken; }
    public void setActiveToken(String activeToken) { this.activeToken = activeToken; }

    public String getActivePatientName() { return activePatientName; }
    public void setActivePatientName(String activePatientName) { this.activePatientName = activePatientName; }

    public int getWaitingCount() { return waitingCount; }
    public void setWaitingCount(int waitingCount) { this.waitingCount = waitingCount; }

    public int getServedTodayCount() { return servedTodayCount; }
    public void setServedTodayCount(int servedTodayCount) { this.servedTodayCount = servedTodayCount; }

    public String getAverageConsultationTime() { return averageConsultationTime; }
    public void setAverageConsultationTime(String averageConsultationTime) { this.averageConsultationTime = averageConsultationTime; }

    public List<Appointment> getTableRecords() { return tableRecords; }
    public void setTableRecords(List<Appointment> tableRecords) { this.tableRecords = tableRecords; }

    public List<String> getRecentAuditLogs() { return recentAuditLogs; }
    public void setRecentAuditLogs(List<String> recentAuditLogs) { this.recentAuditLogs = recentAuditLogs; }
}