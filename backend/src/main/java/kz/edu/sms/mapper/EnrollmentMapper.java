package kz.edu.sms.mapper;
import kz.edu.sms.dto.enrollment.EnrollmentResponse;
import kz.edu.sms.entity.Enrollment;
import org.springframework.stereotype.Component;
@Component
public class EnrollmentMapper {
    public EnrollmentResponse toResponse(Enrollment e){
        return EnrollmentResponse.builder()
            .id(e.getId())
            .studentId(e.getStudent().getId())
            .studentName(e.getStudent().getFirstName()+" "+e.getStudent().getLastName())
            .studentEmail(e.getStudent().getEmail())
            .courseId(e.getCourse().getId())
            .courseName(e.getCourse().getName())
            .courseCode(e.getCourse().getCode())
            .enrollmentDate(e.getEnrollmentDate())
            .status(e.getStatus()).createdAt(e.getCreatedAt()).build();
    }
}
