package kz.edu.sms.dto.schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kz.edu.sms.entity.ScheduleEvent;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ScheduleRequest {
    @NotBlank private String title;
    private Long courseId;
    private String instructor;
    private String room;
    @NotNull private Integer dayOfWeek;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
    private String color;
    private ScheduleEvent.EventType type;
}
