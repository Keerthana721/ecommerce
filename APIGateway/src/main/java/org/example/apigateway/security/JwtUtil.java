package org.example.apigateway.security;



import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;


public class JwtUtil {


    private final String SECRET = "MY_SUPER_SECRET_KEY_1234569883249123840921384821340981230948";


    private final Key secretKey = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String extractToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();

    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

        public boolean isRequestAuthorized(String path, Claims claims) {
//        String role = claims.get("role", String.class);
//
//        if (path.startsWith("/student/**") && !role.equals("ADMIN")) {
//            return false;
//        }

            return true;
        }






}
