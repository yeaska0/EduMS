package kz.edu.sms.service;
import kz.edu.sms.entity.*;
import kz.edu.sms.exception.BadRequestException;
import kz.edu.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository repo;
    @Value("${jwt.refresh-expiration}") private long refreshExpiration;

    @Transactional
    public RefreshToken create(User user){
        repo.deleteByUser(user);
        RefreshToken rt = RefreshToken.builder()
            .token(UUID.randomUUID().toString())
            .user(user)
            .expiresAt(Instant.now().plusMillis(refreshExpiration))
            .build();
        return repo.save(rt);
    }

    public RefreshToken verify(String token){
        RefreshToken rt = repo.findByToken(token)
            .orElseThrow(() -> new BadRequestException("Refresh token not found"));
        if(rt.getExpiresAt().isBefore(Instant.now())){
            repo.delete(rt);
            throw new BadRequestException("Refresh token expired. Please login again.");
        }
        return rt;
    }

    @Transactional
    public void deleteByToken(String token){ repo.deleteByToken(token); }
}
