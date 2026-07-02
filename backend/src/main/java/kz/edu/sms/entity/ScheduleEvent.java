package kz.edu.sms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity @Table(name = "schedule_events") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ScheduleEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false, length = 255)
    private String title;

    private String instructor;

    private String room;

    @Column(nullable = false)
    private Integer dayOfWeek; // 0=Mon, 1=Tue ... 6=Sun

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    private String color;

    @Enumerated(EnumType.STRING) @Builder.Default
    private EventType type = EventType.LECTURE;

    @Column(updatable = false) @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EventType { LECTURE, SEMINAR, LAB, EXAM, OTHER }
}
