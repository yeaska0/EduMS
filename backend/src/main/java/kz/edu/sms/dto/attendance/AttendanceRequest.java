package kz.edu.sms.dto.attendance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceRequest {
    @NotNull private Long studentId;
    @NotNull private Long courseId;
    @NotNull private String date; // ISO: yyyy-MM-dd
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private String note;
}
