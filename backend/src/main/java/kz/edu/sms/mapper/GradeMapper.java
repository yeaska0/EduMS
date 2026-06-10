package kz.edu.sms.mapper;
import kz.edu.sms.dto.grade.GradeResponse;
import kz.edu.sms.entity.Grade;
import org.springframework.stereotype.Component;
@Component
public class GradeMapper {
    public GradeResponse toResponse(Grade g){
        double pct = g.getMaxScore()>0 ? g.getScore()*100.0/g.getMaxScore() : 0;
        return GradeResponse.builder()
            .id(g.getId())
            .studentId(g.getStudent().getId())
            .studentName(g.getStudent().getFirstName()+" "+g.getStudent().getLastName())
            .courseId(g.getCourse().getId())
            .courseName(g.getCourse().getName())
            .score(g.getScore()).maxScore(g.getMaxScore())
            .type(g.getType()).letterGrade(letter(pct)).percentage(Math.round(pct*10)/10.0)
            .semester(g.getSemester()).date(g.getDate()).createdAt(g.getCreatedAt()).build();
    }
    private String letter(double p){
        if(p>=90) return "A"; if(p>=80) return "B";
        if(p>=70) return "C"; if(p>=60) return "D"; return "F";
    }
}
