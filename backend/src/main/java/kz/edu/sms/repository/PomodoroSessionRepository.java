package kz.edu.sms.repository;

import kz.edu.sms.entity.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT COUNT(p) FROM PomodoroSession p WHERE p.user.id = :userId AND p.completed = true")
    long countCompleted(Long userId);
}
