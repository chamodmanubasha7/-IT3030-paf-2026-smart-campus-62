package smart_campus_backend.modulec.ticket.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.modulec.ticket.entity.TicketAttachment;

import java.util.List;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

    long countByTicketId(String ticketId);

    List<TicketAttachment> findByTicketIdOrderByUploadedAtAsc(String ticketId);
}
