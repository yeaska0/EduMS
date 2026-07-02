package kz.edu.sms.dto.task;

import kz.edu.sms.entity.Task;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Long courseId;
    private String courseName;
    private Task.Priority priority;
    private Task.TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
