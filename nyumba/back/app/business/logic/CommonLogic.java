package business.logic;

import models.persistence.Room;
import models.persistence.person.FormerTenant;
import models.persistence.person.Tenant;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import play.db.jpa.Transactional;
import security.Secured;
import util.Args;
import util.Mapper;

import javax.inject.Inject;
import java.util.Map;

/**This class holds utilities functions that are used by more than one class.
 * Created by kip on 7/21/17.
 */
public class CommonLogic {
    private static final Logger.ALogger logger = Logger.of(CommonLogic.class);
    private final JPAApi jpaApi;
    private final Mapper mapper;

    @Inject
    public CommonLogic(JPAApi jpaApi, Mapper mapper){
        this.jpaApi = jpaApi; this.mapper = mapper;

    }

    public void archiveUsers(Room room) {
        jpaApi.withTransaction(() -> {
            if(room.getPersonList().size() > 0){
                FormerTenant formerTenant;
                for(Tenant tenant: room.getPersonList()){
                    formerTenant = new FormerTenant();
                    this.mapper.mapUnrelatedObjects(tenant,formerTenant);
                    formerTenant.setBuildingName(room.getBuilding().getName());
                    formerTenant.setRoomName(room.getName());
                    formerTenant.setBal(room.getBills().last().getBal());
                    jpaApi.em().merge(formerTenant);
                }
            }
        });
    }

    public Users getUser(Map<Args,Object> args){
        return jpaApi.withTransaction(() -> {
            String username = args.get(Args.userName) == null? null: args.get(Args.userName).toString();
            if(username != null){
                return (Users)jpaApi.em().createNamedQuery("select User by username").setParameter("username",username).getSingleResult();
            }else{
                throw new IllegalStateException("User was not found. Cannot be allow to proceed without valid user");
            }
        });
    }

    /**
     * This function is useful when transaction is executing in an asynchronous thread and needs to utilize this function. It keeps the EntityManager in scope for the
     * currently executing transaction.
     * @param args - map of arguments
     * @param jpaApi1 - the entityManager producer to be used for retrieving the user object.
     * @return user - the object that is returned.
     */
    public Users getUser(Map<Args,Object> args,JPAApi jpaApi1){
        String username = args.get(Args.userName) == null? null: args.get(Args.userName).toString();
        if(username != null){
            return (Users)jpaApi1.em().createNamedQuery("select User by username").setParameter("username",username).getSingleResult();
        }else{
            throw new IllegalStateException("User was not found. Cannot be allow to proceed without valid user");
        }
    }
//    public Users getAutomatedUser(){
//        return (Users)jpaApi.em().createNamedQuery("select User by username").setParameter("username","Automated").getSingleResult();
//    }
}
