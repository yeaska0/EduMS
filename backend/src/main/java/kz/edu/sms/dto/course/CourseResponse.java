package kz.edu.sms.dto.course;
import kz.edu.sms.entity.Course;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder public class CourseResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String instructor;
    private String department;
    private Integer credits;
    private Integer capacity;
    private Integer enrolled;
    private Course.Status status;
    private LocalDateTime createdAt;
}
