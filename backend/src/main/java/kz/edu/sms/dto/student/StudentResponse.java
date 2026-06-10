package kz.edu.sms.dto.student;
import kz.edu.sms.entity.Student;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @Builder public class StudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private String major;
    private LocalDate enrollDate;
    private Student.Status status;
    private Double gpa;
    private LocalDateTime createdAt;
}
