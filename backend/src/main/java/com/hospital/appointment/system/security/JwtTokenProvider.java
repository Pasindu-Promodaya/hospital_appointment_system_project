package com.hospital.appointment.system.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Generate a secure cryptographic key for HMAC-SHA signing
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token validity lifespan: 24 hours (in milliseconds)
    private final long jwtExpirationInMs = 86400000;

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }
}