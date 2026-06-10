package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.grade.*;
import kz.edu.sms.service.GradeService;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/grades") @RequiredArgsConstructor
@Tag(name="Grades")
public class GradeController {
    private final GradeService service;

    @GetMapping @Operation(summary="Get all grades")
    public ResponseEntity<PageResponse<GradeResponse>> all(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) Long studentId,
            @RequestParam(required=false) Long courseId){
        if(studentId!=null) return ResponseEntity.ok(service.byStudent(studentId, page, size));
        if(courseId!=null)  return ResponseEntity.ok(service.byCourse(courseId, page, size));
        return ResponseEntity.ok(service.findAll(page, size));
    }

    @GetMapping("/{id}") @Operation(summary="Get grade by ID")
    public ResponseEntity<GradeResponse> one(@PathVariable Long id){
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping @Operation(summary="Add grade")
    public ResponseEntity<GradeResponse> create(@Valid @RequestBody GradeRequest req){
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/{id}") @Operation(summary="Update grade")
    public ResponseEntity<GradeResponse> update(@PathVariable Long id, @Valid @RequestBody GradeRequest req){
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary="Delete grade")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
