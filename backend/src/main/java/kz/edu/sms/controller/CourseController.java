package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.course.*;
import kz.edu.sms.service.CourseService;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
@Tag(name="Courses")
public class CourseController {
    private final CourseService service;

    @GetMapping @Operation(summary="Get all courses")
    public ResponseEntity<PageResponse<CourseResponse>> all(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) String q){
        return ResponseEntity.ok(q!=null && !q.isBlank()
            ? service.search(q, page, size)
            : service.findAll(page, size));
    }

    @GetMapping("/{id}") @Operation(summary="Get course by ID")
    public ResponseEntity<CourseResponse> one(@PathVariable Long id){
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping @Operation(summary="Create course")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest req){
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/{id}") @Operation(summary="Update course")
    public ResponseEntity<CourseResponse> update(@PathVariable Long id, @Valid @RequestBody CourseRequest req){
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary="Delete course")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
