package kz.edu.sms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "pomodoro_sessions") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PomodoroSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Builder.Default
    private boolean completed = false;

    @Column(updatable = false) @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();
}
