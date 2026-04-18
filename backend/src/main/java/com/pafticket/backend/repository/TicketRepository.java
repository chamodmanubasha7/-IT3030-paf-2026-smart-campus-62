package com.pafticket.backend.repository;

import com.pafticket.backend.model.MaintenanceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends MongoRepository<MaintenanceTicket, String> {
}
