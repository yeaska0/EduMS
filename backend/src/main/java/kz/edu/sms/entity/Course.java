package kz.edu.sms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="courses") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String code;
    @Column(nullable=false) private String name;
    @Column(length=1000) private String description;
    private String instructor;
    private String department;
    @Builder.Default private Integer credits = 3;
    @Builder.Default private Integer capacity = 30;
    @Builder.Default private Integer enrolled = 0;
    @Enumerated(EnumType.STRING) @Builder.Default private Status status = Status.ACTIVE;
    @Column(updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate protected void onUpdate(){ updatedAt = LocalDateTime.now(); }
    public enum Status { ACTIVE, INACTIVE, FULL }
}
