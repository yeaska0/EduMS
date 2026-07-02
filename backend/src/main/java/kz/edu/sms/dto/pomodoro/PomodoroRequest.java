package kz.edu.sms.dto.pomodoro;

import lombok.Data;

@Data
public class PomodoroRequest {
    private Long taskId;
    private Integer durationMinutes;
    private boolean completed;
}
