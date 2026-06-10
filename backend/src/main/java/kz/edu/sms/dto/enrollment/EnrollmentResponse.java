package kz.edu.sms.dto.enrollment;
import kz.edu.sms.entity.Enrollment;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder public class EnrollmentResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private LocalDate enrollmentDate;
    private Enrollment.Status status;
    private LocalDateTime createdAt;
}
