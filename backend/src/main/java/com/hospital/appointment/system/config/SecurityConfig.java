package com.hospital.appointment.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity 
@Order(1) // 🎯 Forces absolute precedence to override default security auto-configurations
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 🔓 Disables CSRF for local environment testing
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 🎯 FIXED: Directs Spring to look at our verified source rules bean below
            
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Clear all browser CORS preflight checks
                .requestMatchers("/api/appointments/**", "/api/doctors/**", "/api/**", "/error").permitAll() // Allows open testing access to your APIs explicitly
                .anyRequest().permitAll()
            );
        
        return http.build();
    }

    // 🎯 FIXED: Integrated unified cross-origin criteria explicitly to tie back with Spring Security execution contexts smoothly
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow cookies/auth headers seamlessly
        config.setAllowCredentials(true); 
        
        // Support both possible Vite local server instances explicitly
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        
        // Explicitly allow all standard and custom headers including X-Patient-Id
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Patient-Id"));
        
        // Allow all standard HTTP actions including preflight OPTIONS
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply globally to all paths
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}