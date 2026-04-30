package smart_campus_backend.modulec.ticket;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import smart_campus_backend.modulec.ticket.dto.*;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request, Authentication authentication);

    Page<TicketResponse> listMyTickets(Pageable pageable, Authentication authentication);

    Page<TicketResponse> listTickets(Pageable pageable, Authentication authentication);

    TicketResponse getTicket(String id, Authentication authentication);

    TicketResponse updateStatus(String id, UpdateTicketStatusRequest request, Authentication authentication);

    TicketResponse assignTechnician(String id, AssignTechnicianRequest request, Authentication authentication);

    List<TechnicianOptionResponse> listAssignableTechnicians(Authentication authentication);

    TicketResponse rejectTicket(String id, RejectTicketRequest request, Authentication authentication);

    CommentResponse addComment(String ticketId, AddCommentRequest request, Authentication authentication);

    CommentResponse updateComment(String ticketId, String commentId, UpdateCommentRequest request,
                                    Authentication authentication);

    void deleteComment(String ticketId, String commentId, Authentication authentication);

    AttachmentResponse addAttachment(String ticketId, MultipartFile file, Authentication authentication);

    void deleteAttachment(String ticketId, String attachmentId, Authentication authentication);
}
