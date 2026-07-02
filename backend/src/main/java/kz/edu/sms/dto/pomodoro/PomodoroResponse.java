package kz.edu.sms.dto.pomodoro;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PomodoroResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Integer durationMinutes;
    private boolean completed;
    private LocalDateTime startedAt;
}
