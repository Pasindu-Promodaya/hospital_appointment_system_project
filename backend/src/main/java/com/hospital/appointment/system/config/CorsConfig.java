// package com.hospital.appointment.system.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
// import org.springframework.web.filter.CorsFilter;

// import java.util.Arrays;

// @Configuration
// public class CorsConfig {

//     @Bean
//     public CorsFilter corsFilter() {
//         CorsConfiguration config = new CorsConfiguration();
        
//         // Allow cookies/auth headers seamlessly
//         config.setAllowCredentials(true); 
        
//         // 🎯 FIXED: Support both possible Vite local server instances
//         config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        
//         // 🎯 FIXED: Explicitly allow all standard and custom headers including X-Patient-Id
//         config.setAllowedHeaders(Arrays.asList("*"));
        
//         // Allow all standard HTTP actions including preflight OPTIONS
//         config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", config); // Apply globally to all API paths
        
//         return new CorsFilter(source);
//     }
// }