package kz.edu.sms.dto.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoteRequest {
    @NotBlank @Size(max = 500)
    private String title;
    private String content;
    private Long courseId;
    private String tags;
    private boolean pinned;
}
