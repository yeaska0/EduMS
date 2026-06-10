package kz.edu.sms.util;
import lombok.*;
import java.util.List;
@Data @AllArgsConstructor @Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
