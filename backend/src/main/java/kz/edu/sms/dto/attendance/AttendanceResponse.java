package kz.edu.sms.dto.attendance;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AttendanceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private String date;
    private String status;
    private String note;
}
