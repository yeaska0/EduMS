package kz.edu.sms.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiration}") private long expiration;

    private Key key(){ return Keys.hmacShaKeyFor(secret.getBytes()); }

    public String generateToken(UserDetails u){
        return Jwts.builder().setSubject(u.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis()+expiration))
            .signWith(key(), SignatureAlgorithm.HS256).compact();
    }
    public String extractUsername(String t){
        return Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(t).getBody().getSubject();
    }
    public boolean isValid(String t, UserDetails u){
        try{
            String username = extractUsername(t);
            return username.equals(u.getUsername()) &&
                   !Jwts.parserBuilder().setSigningKey(key()).build()
                        .parseClaimsJws(t).getBody().getExpiration().before(new Date());
        }catch(Exception e){ return false; }
    }
}
