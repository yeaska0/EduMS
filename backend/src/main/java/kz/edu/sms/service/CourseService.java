package kz.edu.sms.service;
import kz.edu.sms.dto.course.*;
import kz.edu.sms.entity.Course;
import kz.edu.sms.exception.*;
import kz.edu.sms.mapper.CourseMapper;
import kz.edu.sms.repository.CourseRepository;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class CourseService {
    private final CourseRepository repo;
    private final CourseMapper mapper;

    public PageResponse<CourseResponse> findAll(int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findAll(pageable));
    }

    public PageResponse<CourseResponse> search(String q, int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.search(q.toLowerCase(), pageable));
    }

    public CourseResponse findById(Long id){ return mapper.toResponse(get(id)); }

    public CourseResponse create(CourseRequest req){
        if(repo.existsByCode(req.getCode()))
            throw new DuplicateResourceException("Course code already exists: " + req.getCode());
        return mapper.toResponse(repo.save(mapper.toEntity(req)));
    }

    public CourseResponse update(Long id, CourseRequest req){
        Course c = get(id);
        if(repo.existsByCodeAndIdNot(req.getCode(), id))
            throw new DuplicateResourceException("Course code already exists: " + req.getCode());
        mapper.update(c, req);
        return mapper.toResponse(repo.save(c));
    }

    public void delete(Long id){ get(id); repo.deleteById(id); }

    public Course get(Long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Course not found: "+id));
    }

    private PageResponse<CourseResponse> toPage(Page<Course> p){
        return PageResponse.<CourseResponse>builder()
            .content(p.getContent().stream().map(mapper::toResponse).toList())
            .page(p.getNumber()).size(p.getSize())
            .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
