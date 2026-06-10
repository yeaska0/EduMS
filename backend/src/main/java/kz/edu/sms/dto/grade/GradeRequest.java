package kz.edu.sms.dto.grade;
import jakarta.validation.constraints.*;
import kz.edu.sms.entity.Grade;
import lombok.Data;
import java.time.LocalDate;
@Data public class GradeRequest {
    @NotNull private Long studentId;
    @NotNull private Long courseId;
    @NotNull @Min(0) @Max(100) private Integer score;
    private Integer maxScore;
    private Grade.Type type;
    private String semester;
    private LocalDate date;
}
