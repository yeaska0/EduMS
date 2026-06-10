package kz.edu.sms.dto.student;
import jakarta.validation.constraints.*;
import kz.edu.sms.entity.Student;
import lombok.Data;
import java.time.LocalDate;
@Data public class StudentRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @Email @NotBlank private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private String major;
    private LocalDate enrollDate;
    private Student.Status status;
    private Double gpa;
}
