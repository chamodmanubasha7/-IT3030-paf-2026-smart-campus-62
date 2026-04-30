package smart_campus_backend.modulec.ticket.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.modulec.ticket.entity.TicketComment;

import java.util.List;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
