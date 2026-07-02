package kz.edu.sms.dto.note;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private Long courseId;
    private String courseName;
    private String tags;
    private boolean pinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
