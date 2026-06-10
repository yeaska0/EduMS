package kz.edu.sms.mapper;
import kz.edu.sms.dto.student.*;
import kz.edu.sms.entity.Student;
import org.springframework.stereotype.Component;
@Component
public class StudentMapper {
    public StudentResponse toResponse(Student s){
        return StudentResponse.builder()
            .id(s.getId()).firstName(s.getFirstName()).lastName(s.getLastName())
            .fullName(s.getFirstName()+" "+s.getLastName())
            .email(s.getEmail()).phone(s.getPhone()).birthDate(s.getBirthDate())
            .address(s.getAddress()).major(s.getMajor()).enrollDate(s.getEnrollDate())
            .status(s.getStatus()).gpa(s.getGpa()).createdAt(s.getCreatedAt()).build();
    }
    public Student toEntity(StudentRequest r){
        return Student.builder()
            .firstName(r.getFirstName()).lastName(r.getLastName()).email(r.getEmail())
            .phone(r.getPhone()).birthDate(r.getBirthDate()).address(r.getAddress())
            .major(r.getMajor()).enrollDate(r.getEnrollDate())
            .status(r.getStatus()!=null?r.getStatus():Student.Status.ACTIVE)
            .gpa(r.getGpa()!=null?r.getGpa():0.0).build();
    }
    public void update(Student s, StudentRequest r){
        s.setFirstName(r.getFirstName()); s.setLastName(r.getLastName());
        s.setEmail(r.getEmail()); s.setPhone(r.getPhone());
        s.setBirthDate(r.getBirthDate()); s.setAddress(r.getAddress());
        s.setMajor(r.getMajor()); s.setEnrollDate(r.getEnrollDate());
        if(r.getStatus()!=null) s.setStatus(r.getStatus());
        if(r.getGpa()!=null) s.setGpa(r.getGpa());
    }
}
