package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.student.*;
import kz.edu.sms.service.StudentService;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/students") @RequiredArgsConstructor
@Tag(name="Students")
public class StudentController {
    private final StudentService service;

    @GetMapping @Operation(summary="Get all students (paginated)")
    public ResponseEntity<PageResponse<StudentResponse>> all(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="createdAt") String sort,
            @RequestParam(required=false) String q){
        return ResponseEntity.ok(q!=null && !q.isBlank()
            ? service.search(q, page, size)
            : service.findAll(page, size, sort));
    }

    @GetMapping("/{id}") @Operation(summary="Get student by ID")
    public ResponseEntity<StudentResponse> one(@PathVariable Long id){
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping @Operation(summary="Create student")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest req){
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/{id}") @Operation(summary="Update student")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id, @Valid @RequestBody StudentRequest req){
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary="Delete student")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
