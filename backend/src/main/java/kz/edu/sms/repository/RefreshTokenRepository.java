package kz.edu.sms.repository;
import kz.edu.sms.entity.RefreshToken;
import kz.edu.sms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
    Optional<RefreshToken> findByToken(String token);
    @Modifying void deleteByUser(User user);
    void deleteByToken(String token);
}
