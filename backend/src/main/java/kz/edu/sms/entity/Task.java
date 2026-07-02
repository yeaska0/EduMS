package kz.edu.sms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "tasks") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING) @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING) @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Column(updatable = false) @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Priority { LOW, MEDIUM, HIGH, URGENT }
    public enum TaskStatus { TODO, IN_PROGRESS, DONE }
}
