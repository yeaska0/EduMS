package kz.edu.sms.dto.grade;
import kz.edu.sms.entity.Grade;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder public class GradeResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private Integer score;
    private Integer maxScore;
    private Grade.Type type;
    private String letterGrade;
    private Double percentage;
    private String semester;
    private LocalDate date;
    private LocalDateTime createdAt;
}
