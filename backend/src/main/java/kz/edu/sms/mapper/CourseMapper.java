package kz.edu.sms.mapper;
import kz.edu.sms.dto.course.*;
import kz.edu.sms.entity.Course;
import org.springframework.stereotype.Component;
@Component
public class CourseMapper {
    public CourseResponse toResponse(Course c){
        return CourseResponse.builder()
            .id(c.getId()).code(c.getCode()).name(c.getName())
            .description(c.getDescription()).instructor(c.getInstructor())
            .department(c.getDepartment()).credits(c.getCredits())
            .capacity(c.getCapacity()).enrolled(c.getEnrolled())
            .status(c.getStatus()).createdAt(c.getCreatedAt()).build();
    }
    public Course toEntity(CourseRequest r){
        return Course.builder()
            .code(r.getCode()).name(r.getName()).description(r.getDescription())
            .instructor(r.getInstructor()).department(r.getDepartment())
            .credits(r.getCredits()!=null?r.getCredits():3)
            .capacity(r.getCapacity()!=null?r.getCapacity():30)
            .status(r.getStatus()!=null?r.getStatus():Course.Status.ACTIVE).build();
    }
    public void update(Course c, CourseRequest r){
        c.setCode(r.getCode()); c.setName(r.getName()); c.setDescription(r.getDescription());
        c.setInstructor(r.getInstructor()); c.setDepartment(r.getDepartment());
        if(r.getCredits()!=null) c.setCredits(r.getCredits());
        if(r.getCapacity()!=null) c.setCapacity(r.getCapacity());
        if(r.getStatus()!=null) c.setStatus(r.getStatus());
    }
}
