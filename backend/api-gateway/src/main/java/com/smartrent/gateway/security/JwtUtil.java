package com.smartrent.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
// 3ashan Spring yshoof el class da w ye-manage el lifecycle bta3o (Bean)

public class JwtUtil {

    // Bys7ab el secret key mn el application.yml (el basma bta3t el tashfeer)
    @Value("${app.jwt.secret}")
    private String secret;

    // By7awel el secret string bta3na le Cryptographic Key n2dar neshafar/nefok
    // beeh
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    // El 7ares bta3na: byt2aked en el token slym (msh expired w m7dsh le3eb feeh)
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // De b2a el method el asaseya elly btfok ta4feer el token w tgeeb el JSON
    // payload elly gowah
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
