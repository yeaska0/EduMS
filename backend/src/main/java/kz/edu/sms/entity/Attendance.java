package kz.edu.sms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="attendance") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id",nullable=false) private Student student;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="course_id",nullable=false) private Course course;
    @Column(nullable=false) private LocalDate date;
    @Enumerated(EnumType.STRING) @Builder.Default private Status status = Status.PRESENT;
    private String note;
    @Builder.Default @Column(updatable=false) private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { PRESENT, ABSENT, LATE, EXCUSED }
}
