package kz.edu.sms.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import kz.edu.sms.entity.Task;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank @Size(max = 500)
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Long courseId;
    private Task.Priority priority;
    private Task.TaskStatus status;
}
