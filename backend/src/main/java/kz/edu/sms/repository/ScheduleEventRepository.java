package kz.edu.sms.repository;

import kz.edu.sms.entity.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {
    List<ScheduleEvent> findByUserIdOrderByDayOfWeekAscStartTimeAsc(Long userId);
}
