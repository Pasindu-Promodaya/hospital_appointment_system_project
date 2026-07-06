# Hospital Appointment Management System

## 📳 Notification Subsystem Setup

The system automatically handles Email alerts and WhatsApp queue notifications. To make sure these dispatches work on your machine, you must set up your local environment keys.

### ⚙️ Required Local Environment Variables

Set the following keys on your operating system or inside your active terminal workspace:

1. `HOSPITAL_EMAIL_USER` - The Gmail address used to send alerts.
2. `HOSPITAL_EMAIL_PASSWORD` - The app-specific password generated from Google Account Security.
3. `TWILIO_ACCOUNT_SID` - Your personal Twilio account string identifier.
4. `TWILIO_AUTH_TOKEN` - Your private Twilio developer authorization token.

### 📲 Join the WhatsApp Sandbox

Before testing live token proximity triggers, grab your mobile device, scan the QR code located in the team's Twilio account console, or send a WhatsApp text saying `join useful-bicycle` to `+1 415 523 8886`.
