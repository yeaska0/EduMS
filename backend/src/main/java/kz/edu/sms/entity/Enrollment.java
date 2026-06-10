package kz.edu.sms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="enrollments",
    uniqueConstraints=@UniqueConstraint(columnNames={"student_id","course_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id",nullable=false) private Student student;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="course_id",nullable=false) private Course course;
    @Builder.Default private LocalDate enrollmentDate = LocalDate.now();
    @Enumerated(EnumType.STRING) @Builder.Default private Status status = Status.ACTIVE;
    @Column(updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    public enum Status { ACTIVE, DROPPED, COMPLETED }
}
