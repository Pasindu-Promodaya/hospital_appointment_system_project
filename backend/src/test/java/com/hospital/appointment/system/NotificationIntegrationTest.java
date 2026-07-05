package com.hospital.appointment.system;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

// IMPORTED: Security test utilities to handle CSRF tokens
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc; 

    @Test
    @WithMockUser(username = "admin_test_user", roles = {"ADMIN"}) 
    @SuppressWarnings("null")
    public void testAppointmentLifecycleNotificationWithSecurityActive() throws Exception {
        String testPayload = """
            {
              "appointmentId": 120,
              "patientId": 450,
              "email": "pasindupramodaya0@gmail.com",
              "phone": "+94763372067",
              "status": "APPROVED",
              "date": "2026-07-05",
              "time": "09:30 AM"
            }
        """;

        // EXECUTING: Passing a valid CSRF token along with the admin role context
        mockMvc.perform(MockMvcRequestBuilders.post("/api/test/notifications/lifecycle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testPayload)
                .with(csrf())) // Generates and attaches a valid CSRF token to the request
                .andExpect(MockMvcResultMatchers.status().isOk()); 
    }
}