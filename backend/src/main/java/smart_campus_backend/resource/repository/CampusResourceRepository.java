package smart_campus_backend.resource.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import smart_campus_backend.resource.entity.CampusResource;
import smart_campus_backend.resource.entity.ResourceStatus;
import smart_campus_backend.resource.entity.ResourceType;

import java.util.List;

@Repository
public interface CampusResourceRepository extends MongoRepository<CampusResource, String> {

    List<CampusResource> findByType(ResourceType type);

    List<CampusResource> findByStatus(ResourceStatus status);

    List<CampusResource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    List<CampusResource> findByCapacityGreaterThanEqual(Integer minCapacity);

    @Query(value = "{ 'status' : 'ACTIVE' }", count = true)
    long countActive();

    @Query(value = "{ 'status' : 'OUT_OF_SERVICE' }", count = true)
    long countOutOfService();

    @Query(value = "{ 'name' : { $regex : '^?0$', $options : 'i' }, 'location' : { $regex : '^?1$', $options : 'i' }, 'type' : ?2, 'capacity' : ?3 }", count = true)
    Long countDuplicate(String name, String location, ResourceType type, Integer capacity);

    default boolean existsDuplicate(String name, String location, ResourceType type, Integer capacity) {
        return countDuplicate(name, location, type, capacity) > 0;
    }

    @Query(value = "{ 'name' : { $regex : '^?0$', $options : 'i' }, 'location' : { $regex : '^?1$', $options : 'i' }, 'type' : ?2, 'capacity' : ?3, '_id' : { $ne : ?4 } }", count = true)
    Long countDuplicateExcluding(String name, String location, ResourceType type, Integer capacity, String excludeId);

    default boolean existsDuplicateExcluding(String name, String location, ResourceType type, Integer capacity, String excludeId) {
        return countDuplicateExcluding(name, location, type, capacity, excludeId) > 0;
    }
}
