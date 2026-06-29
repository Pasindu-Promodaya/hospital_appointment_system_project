package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Notification;
import com.hospital.appointment.system.model.NotificationType;
import com.hospital.appointment.system.model.DeliveryStatus;
import com.hospital.appointment.system.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${twilio.account.sid}")
    private String twilioSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.whatsapp.number}")
    private String twilioWhatsAppNumber;

    @Value("${spring.mail.username}")
    private String senderMailAddress;

    @PostConstruct
    public void initializeExternalTwilioSDK() {
        // Establishes platform-independent bridge interaction with Twilio network infrastructure
        Twilio.init(twilioSid, twilioAuthToken);
    }

    // 📧 EMAIL CHANNEL DISPATCH ROUTER (Zero-Cost SMTP Relay)
    public void sendEmailAlert(String toEmail, String subject, String body, Integer appointmentId, Integer patientId, NotificationType type) {
        Notification auditEntry = new Notification();
        auditEntry.setAppointmentId(appointmentId);
        auditEntry.setPatientId(patientId);
        auditEntry.setType(type);
        auditEntry.setMessage(body);

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(senderMailAddress);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            
            mailSender.send(mailMessage);
            auditEntry.setDeliveryStatus(DeliveryStatus.SENT);
        } catch (Exception e) {
            auditEntry.setDeliveryStatus(DeliveryStatus.FAILED);
        }
        notificationRepository.save(auditEntry);
    }

    // 💬 REFACTORED WORKFLOW: WHATSAPP CHANNEL DISPATCH ROUTER (Twilio WhatsApp Sandbox API)
    public void sendWhatsAppAlert(String toPhone, String textBody, Integer appointmentId, Integer patientId, NotificationType type) {
        Notification auditEntry = new Notification();
        auditEntry.setAppointmentId(appointmentId);
        auditEntry.setPatientId(patientId);
        auditEntry.setType(type);
        auditEntry.setMessage(textBody);

        try {
            // CRITICAL: Twilio WhatsApp messaging requires formatting numbers with the 'whatsapp:' identifier prefix
            String senderFormatted = "whatsapp:" + twilioWhatsAppNumber;
            String recipientFormatted = "whatsapp:" + toPhone;

            Message.creator(
                new PhoneNumber(recipientFormatted),
                new PhoneNumber(senderFormatted),
                textBody
            ).create();
            
            auditEntry.setDeliveryStatus(DeliveryStatus.SENT);
        } catch (Exception e) {
            auditEntry.setDeliveryStatus(DeliveryStatus.FAILED);
        }
        notificationRepository.save(auditEntry);
    }

    // 🔗 HOOK 1: Triggers whenever Member 2 creates, reschedules, or cancels appointments
    public void processAppointmentLifecycleChange(Integer appointmentId, Integer patientId, String email, String phone, String actionStatus, String date, String time) {
        String msgContent = "Hospital Update Notice: Your appointment status has changed to [" + actionStatus + "] for scheduled date: " + date + " during time window: " + time + ".";
        
        NotificationType type = NotificationType.BOOKING_CONFIRMATION;
        if (actionStatus.equalsIgnoreCase("CANCELLED")) {
            type = NotificationType.CANCELLATION;
        } else if (actionStatus.equalsIgnoreCase("RESCHEDULED")) {
            type = NotificationType.RESCHEDULE;
        }

        // Dispatches to Email and WhatsApp Sandbox concurrently for verification tracking
        sendEmailAlert(email, "Hospital Update - Booking " + actionStatus, msgContent, appointmentId, patientId, type);
        sendWhatsAppAlert(phone, msgContent, appointmentId, patientId, type);
    }

    // 🔗 HOOK 2: Triggers inside Member 4's live queue sequencer loops (The Next-but-One rule)
    public void monitorQueueProximityAndNotify(int currentServingToken, int patientTargetToken, String phone, Integer appointmentId, Integer patientId) {
        int linearPositionGap = patientTargetToken - currentServingToken;

        // Condition boundaries validation: automatically send a warning WhatsApp text when exactly 2 spots away
        if (linearPositionGap == 2) {
            String warningWhatsAppPayload = "Live Queue Update: Room is currently treating Token #" + currentServingToken 
                + ". Your assigned sequence is Token #" + patientTargetToken 
                + ". There are exactly 2 spots left before you are called. Please proceed to the clinic waiting area immediately.";
            
            sendWhatsAppAlert(phone, warningWhatsAppPayload, appointmentId, patientId, NotificationType.QUEUE_REMINDER);
        }
    }

    // 🔗 REUSABLE INTER-COMPONENT HOOK: General Notices & Medical Report Updates
    public void triggerGeneralHospitalNotice(Integer patientId, String targetEmail, String specificSubject, String informationNotice) {
        sendEmailAlert(targetEmail, specificSubject, informationNotice, 0, patientId, NotificationType.GENERAL_NOTICE);
    }
}