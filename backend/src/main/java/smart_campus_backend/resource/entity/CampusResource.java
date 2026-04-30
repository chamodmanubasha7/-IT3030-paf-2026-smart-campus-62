package smart_campus_backend.resource.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "campus_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusResource {

    @Id
    private String id;

    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private String imageUrl;

    private String description;

    private String downloadUrl;

    @Builder.Default
    private Boolean available = true;
}
