package kz.edu.sms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="students") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String firstName;
    @Column(nullable=false) private String lastName;
    @Column(unique=true,nullable=false) private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private String major;
    private LocalDate enrollDate;
    @Enumerated(EnumType.STRING) @Builder.Default private Status status = Status.ACTIVE;
    @Builder.Default private Double gpa = 0.0;
    @Column(updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate protected void onUpdate(){ updatedAt = LocalDateTime.now(); }
    public enum Status { ACTIVE, INACTIVE, GRADUATED }
}
