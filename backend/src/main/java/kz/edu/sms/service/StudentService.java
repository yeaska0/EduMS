package kz.edu.sms.service;
import kz.edu.sms.dto.student.*;
import kz.edu.sms.entity.Student;
import kz.edu.sms.exception.*;
import kz.edu.sms.mapper.StudentMapper;
import kz.edu.sms.repository.StudentRepository;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class StudentService {
    private final StudentRepository repo;
    private final StudentMapper mapper;

    public PageResponse<StudentResponse> findAll(int page, int size, String sort){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));
        Page<Student> p = repo.findAll(pageable);
        return toPage(p);
    }

    public PageResponse<StudentResponse> search(String q, int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Student> p = repo.search(q.toLowerCase(), pageable);
        return toPage(p);
    }

    public StudentResponse findById(Long id){
        return mapper.toResponse(get(id));
    }

    public StudentResponse create(StudentRequest req){
        if(repo.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Email already in use: " + req.getEmail());
        return mapper.toResponse(repo.save(mapper.toEntity(req)));
    }

    public StudentResponse update(Long id, StudentRequest req){
        Student s = get(id);
        if(repo.existsByEmailAndIdNot(req.getEmail(), id))
            throw new DuplicateResourceException("Email already in use: " + req.getEmail());
        mapper.update(s, req);
        return mapper.toResponse(repo.save(s));
    }

    public void delete(Long id){ get(id); repo.deleteById(id); }

    private Student get(Long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Student not found: "+id));
    }

    private PageResponse<StudentResponse> toPage(Page<Student> p){
        return PageResponse.<StudentResponse>builder()
            .content(p.getContent().stream().map(mapper::toResponse).toList())
            .page(p.getNumber()).size(p.getSize())
            .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
