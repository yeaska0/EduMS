package kz.edu.sms.dto.schedule;

import kz.edu.sms.entity.ScheduleEvent;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ScheduleResponse {
    private Long id;
    private String title;
    private Long courseId;
    private String courseName;
    private String instructor;
    private String room;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String color;
    private ScheduleEvent.EventType type;
}
