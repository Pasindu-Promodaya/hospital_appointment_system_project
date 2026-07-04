package com.hospital.appointment.system.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // 🎯 FIX: Define a static, secure 256-bit secret string instead of creating an in-memory random one
    // In production, you would pull this safely out of your application.properties file!
    private static final String SECRET_STRING = "9a72dfa64c48563d7a9b23f58e1d2c3b4a5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s";

    private final Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_STRING));
    
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