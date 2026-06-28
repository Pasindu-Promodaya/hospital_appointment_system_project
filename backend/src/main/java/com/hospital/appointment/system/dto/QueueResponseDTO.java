package com.hospital.appointment.system.dto;

public class QueueResponseDTO {
    private String activeToken;
    private String nextToken;
    private int waitingCount;

    public QueueResponseDTO(String activeToken, String nextToken, int waitingCount) {
        this.activeToken = activeToken;
        this.nextToken = nextToken;
        this.waitingCount = waitingCount;
    }

    public String getActiveToken() { return activeToken; }
    public void setActiveToken(String activeToken) { this.activeToken = activeToken; }

    public String getNextToken() { return nextToken; }
    public void setNextToken(String nextToken) { this.nextToken = nextToken; }

    public int getWaitingCount() { return waitingCount; }
    public void setWaitingCount(int waitingCount) { this.waitingCount = waitingCount; }
}