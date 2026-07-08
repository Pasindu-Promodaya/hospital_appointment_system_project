package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Notification;
import com.hospital.appointment.system.model.NotificationType;
import com.hospital.appointment.system.model.DeliveryStatus;
import com.hospital.appointment.system.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
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
        Twilio.init(twilioSid, twilioAuthToken);
    }

    // EMAIL CHANNEL DISPATCH ROUTER (Rich HTML Layout Engine)
    public void sendEmailAlert(String toEmail, String subject, String htmlBody, Integer appointmentId, Integer patientId, NotificationType type) {
        Notification auditEntry = new Notification();
        auditEntry.setAppointmentId(appointmentId);
        auditEntry.setPatientId(patientId);
        auditEntry.setType(type);
        auditEntry.setMessage("HTML Layout Dispatch");

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(senderMailAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); 
            
            mailSender.send(mimeMessage);
            auditEntry.setDeliveryStatus(DeliveryStatus.SENT);
        } catch (Exception e) {
            e.printStackTrace();
            auditEntry.setDeliveryStatus(DeliveryStatus.FAILED);
        }
        notificationRepository.save(auditEntry);
    }

    //WHATSAPP CHANNEL DISPATCH ROUTER
    public void sendWhatsAppAlert(String toPhone, String textBody, Integer appointmentId, Integer patientId, NotificationType type) {
        Notification auditEntry = new Notification();
        auditEntry.setAppointmentId(appointmentId);
        auditEntry.setPatientId(patientId);
        auditEntry.setType(type);
        auditEntry.setMessage(textBody);

        try {
            // : Automatically format incoming local number strings to standard international E.164 formatting rules
            String cleanPhone = toPhone.trim().replaceAll("\\s+", "");
            
            if (!cleanPhone.startsWith("+")) {
                if (cleanPhone.startsWith("0")) {
                    // Strips the leading zero and maps Sri Lanka's prefix code (+94)
                    cleanPhone = "+94" + cleanPhone.substring(1);
                } else {
                    cleanPhone = "+94" + cleanPhone;
                }
            }

            String senderFormatted = "whatsapp:" + twilioWhatsAppNumber;
            String recipientFormatted = "whatsapp:" + cleanPhone;

            Message.creator(
                new PhoneNumber(recipientFormatted),
                new PhoneNumber(senderFormatted),
                textBody
            ).create();
            
            auditEntry.setDeliveryStatus(DeliveryStatus.SENT);
            System.out.println(" WhatsApp notification securely pushed out to device target node: " + recipientFormatted);
        } catch (Exception e) {
            System.err.println(" CRITICAL TWILIO WHATSAPP FAILURE: " + e.getMessage());
            e.printStackTrace();
            auditEntry.setDeliveryStatus(DeliveryStatus.FAILED);
        }
        notificationRepository.save(auditEntry);
    }

    // 🎯 HOOK 3: Triggers when Admin registers a new Doctor profile account
    public void sendDoctorOnboardingCredentials(String toEmail, String doctorName, String rawPassword) {
        Notification auditEntry = new Notification();
        auditEntry.setAppointmentId(0); 
        auditEntry.setPatientId(0);     
        auditEntry.setType(NotificationType.GENERAL_NOTICE);
        auditEntry.setMessage("Onboarding Credentials Dispatched");

        String portalLoginUrl = "http://localhost:5173/login/staff"; 

        String htmlLayout = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>"
            + "<div style='width: 100%; font-family: sans-serif; background-color: #f8fafc; padding: 40px 0;'>"
            + "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
            + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1d4ed8 100%); padding: 32px;'>"
            + "      <span style='color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.25em;'>Provider Onboarding</span>"
            + "      <h1 style='color: #ffffff; font-size: 26px; font-weight: 800; margin: 8px 0 0 0;'>Welcome, " + doctorName + "</h1>"
            + "    </div>"
            + "    <div style='padding: 32px;'>"
            + "      <p style='font-size: 15px; color: #64748b; line-height: 1.6;'>Your medical practitioner profile has been successfully provisioned by the system administrator. Use the secure access keys below to enter the gateway portal:</p>"
            + "      <div style='background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin: 24px 0;'>"
            + "        <div style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Portal Gateway</span><span style='float: right; font-size: 14px; font-weight: 700; color: #1d4ed8;'><a href='" + portalLoginUrl + "' style='color: #1d4ed8; text-decoration: none;'>Staff Login Link</a></span></div>"
            + "        <div style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Username (Email)</span><span style='float: right; font-size: 14px; font-weight: 700; color: #334155;'>" + toEmail + "</span></div>"
            + "        <div style='padding: 10px 0;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Temporary Password</span><span style='float: right; font-size: 14px; font-weight: 700; color: #ef4444; font-family: monospace; background: #fee2e2; padding: 2px 8px; border-radius: 6px;'>" + rawPassword + "</span></div>"
            + "      </div>"
            + "      <p style='font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; line-height: 1.5;'>⚠️ **Security Notice:** For institutional compliance, please make sure to customize this temporary access key within your first profile session.</p>"
            + "    </div>"
            + "  </div>"
            + "</div>"
            + "</body></html>";

        sendEmailAlert(toEmail, "Hospital Staff Account Provisioned", htmlLayout, 0, 0, NotificationType.GENERAL_NOTICE);
    }

    //  Fully Configured with Patient Name, Doctor Name, Tokens, Dates, and Times
    public void processAppointmentLifecycleChange(
            Integer appointmentId, Integer patientId, String email, String phone, 
            String actionStatus, String date, String time, 
            String patientName, String doctorName, int tokenNumber, int queueOrder) {
        
        String statusColor = "#10b981"; 
        NotificationType type = NotificationType.BOOKING_CONFIRMATION;
        
        if (actionStatus.equalsIgnoreCase("CANCELLED")) {
            statusColor = "#f43f5e"; 
            type = NotificationType.CANCELLATION;
        }

        String htmlLayout = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>"
            + "<div style='width: 100%; font-family: sans-serif; background-color: #f8fafc; padding: 40px 0;'>"
            + "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
            + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1d4ed8 100%); padding: 32px;'>"
            + "      <span style='color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.25em;'>Care Coordination</span>"
            + "      <h1 style='color: #ffffff; font-size: 26px; font-weight: 800; margin: 8px 0 0 0;'>Appointment " + (actionStatus.equalsIgnoreCase("CANCELLED") ? "Cancelled" : "Confirmed") + "</h1>"
            + "    </div>"
            + "    <div style='padding: 32px;'>"
            + "      <p style='font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0;'>Dear " + patientName + ",</p>"
            + "      <p style='font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0;'>Your medical consultation schedule status has been modified. Please verify your clinic visit credentials details below:</p>"
            + "      <div style='background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin: 24px 0;'>"
            + "        <div style='padding: 10px 0; border-bottom: 1px solid #e2e8f0; min-height: 20px;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Current Status</span><span style='float: right; font-size: 14px; font-weight: 700; color: " + statusColor + ";'>" + actionStatus + "</span></div>"
            + "        <div style='padding: 10px 0; border-bottom: 1px solid #e2e8f0; min-height: 20px;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Medical Professional</span><span style='float: right; font-size: 14px; font-weight: 700; color: #334155;'>" + doctorName + "</span></div>"
            + "        <div style='padding: 10px 0; border-bottom: 1px solid #e2e8f0; min-height: 20px;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Scheduled Date</span><span style='float: right; font-size: 14px; font-weight: 700; color: #334155;'>" + date + "</span></div>"
            + "        <div style='padding: 10px 0; min-height: 20px;'><span style='font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Allocated Time Slot</span><span style='float: right; font-size: 14px; font-weight: 700; color: #334155;'>" + time + "</span></div>"
            + "      </div>"
            + "      <div style='grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; text-align: center; font-size: 0;'>"
            + "        <div style='display: inline-block; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; background-color: #eff6ff; border: 1px solid #dbeafe; color: #1d4ed8; margin: 0 6px; text-transform: uppercase; letter-spacing: 0.1em;'>Token #" + tokenNumber + "</div>"
            + "        <div style='display: inline-block; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; background-color: #faf5ff; border: 1px solid #f3e8ff; color: #6b21a8; margin: 0 6px; text-transform: uppercase; letter-spacing: 0.1em;'>Queue Order #" + queueOrder + "</div>"
            + "      </div>"
            + "      <p style='font-size: 12px; color: #94a3b8; text-align: center; margin-top: 36px;'>Please arrive 15 minutes early. Manage allocations anytime via the Patient Portal.</p>"
            + "    </div>"
            + "  </div>"
            + "</div>"
            + "</body></html>";

        //  Adheres strictly to standard pre-approved Twilio developer trial message layouts to secure clean delivery
        String twilioPlainNotice = "Your appointment reminder on " + date + " at " + time + " with " + doctorName 
            + ". Your token number is #" + tokenNumber + ". Status: " + actionStatus.toUpperCase();

        sendEmailAlert(email, "Hospital Update - Booking " + actionStatus, htmlLayout, appointmentId, patientId, type);
        sendWhatsAppAlert(phone, twilioPlainNotice, appointmentId, patientId, type);
    }

    //  Live queue sequencer loops (The Next-but-One rule)
    public void monitorQueueProximityAndNotify(int currentServingToken, int patientTargetToken, String phone, Integer appointmentId, Integer patientId) {
        int linearPositionGap = patientTargetToken - currentServingToken;

        if (linearPositionGap == 2) {
            String warningWhatsAppPayload = "Live Queue Update: Room is currently treating Token #" + currentServingToken 
                + ". Your assigned sequence is Token #" + patientTargetToken 
                + ". There are exactly 2 spots left before you are called. Please proceed to the clinic waiting area immediately.";
            
            sendWhatsAppAlert(phone, warningWhatsAppPayload, appointmentId, patientId, NotificationType.QUEUE_REMINDER);
        }
    }

    //  REUSABLE INTER-COMPONENT HOOK: General Notices
    public void triggerGeneralHospitalNotice(Integer patientId, String targetEmail, String specificSubject, String informationNotice) {
        sendEmailAlert(targetEmail, specificSubject, informationNotice, 0, patientId, NotificationType.GENERAL_NOTICE);
    }
}