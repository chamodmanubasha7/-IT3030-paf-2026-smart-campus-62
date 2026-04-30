package smart_campus_backend.modulec.ticket.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import smart_campus_backend.modulec.ticket.entity.Ticket;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    Page<Ticket> findByCreatedByIdOrderByCreatedAtDesc(String createdById, Pageable pageable);

    Page<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId, Pageable pageable);

    Page<Ticket> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
