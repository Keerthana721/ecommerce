package org.example.shippingservice.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET = "MY_SUPER_SECRET_KEY_1234569883249123840921384821340981230948";
    
    private final long EXPIRATION = 1000* 60;

    private final Key secretKey = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username) {
       return Jwts.builder()
               .setSubject(username)
               .setIssuedAt(new Date(System.currentTimeMillis()))
               .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
               .signWith(secretKey, SignatureAlgorithm.HS256)
               .compact();
    }

    public String extractToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();

    }

    public boolean validateToken(String token) {
       try{
           extractToken(token);
           return true;
       }
       catch (JwtException jwtException){
           return false;
       }
    }
}
