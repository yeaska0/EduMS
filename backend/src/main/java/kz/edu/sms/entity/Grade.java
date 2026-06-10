package kz.edu.sms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="grades") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Grade {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id",nullable=false) private Student student;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="course_id",nullable=false) private Course course;
    @Column(nullable=false) private Integer score;
    @Builder.Default private Integer maxScore = 100;
    @Enumerated(EnumType.STRING) @Builder.Default private Type type = Type.ASSIGNMENT;
    private String semester;
    private LocalDate date;
    @Column(updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    public enum Type { MIDTERM, FINAL, ASSIGNMENT, QUIZ, PROJECT }
}
