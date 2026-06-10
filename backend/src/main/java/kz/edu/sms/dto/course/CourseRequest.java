package kz.edu.sms.dto.course;
import jakarta.validation.constraints.*;
import kz.edu.sms.entity.Course;
import lombok.Data;
@Data public class CourseRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private String description;
    private String instructor;
    private String department;
    private Integer credits;
    private Integer capacity;
    private Course.Status status;
}
