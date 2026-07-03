package com.hospital.appointment.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow cookies/auth headers if needed
        config.setAllowCredentials(true); 
        
        // Explicitly target your Vite development server origin
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // 🎯 Explicitly allow your custom header 'X-Patient-Id'
        config.setAllowedHeaders(Arrays.asList(
            "Origin", 
            "Content-Type", 
            "Accept", 
            "Authorization", 
            "X-Patient-Id"
        ));
        
        // Allow all standard standard HTTP actions including preflight OPTIONS
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply globally to all API paths
        
        return new CorsFilter(source);
    }
}