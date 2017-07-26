package business.logic;

import models.persistence.Room;
import models.persistence.person.FormerTenant;
import models.persistence.person.Tenant;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
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
        if(room.getPersonList().size() > 0){
            FormerTenant formerTenant;
            for(Tenant tenant: room.getPersonList()){
                formerTenant = new FormerTenant();
                this.mapper.mapFields(tenant,formerTenant);
                formerTenant.setBuildingName(room.getBuilding().getName());
                formerTenant.setRoomName(room.getName());
                formerTenant.setBal(room.getBills().last().getBal());
                jpaApi.em().merge(formerTenant);
            }
        }
    }
    public Users getUser(Map<Args,Object> args){

        String username = args.get(Args.userName) == null? null: args.get(Args.userName).toString();
        if(username != null){
            return (Users)jpaApi.em().createNamedQuery("select User by username").setParameter("username",username).getSingleResult();
        }else{
            throw new IllegalStateException("User was not found. Cannot be allow to proceed without valid user");
        }
    }
//    public Users getAutomatedUser(){
//        return (Users)jpaApi.em().createNamedQuery("select User by username").setParameter("username","Automated").getSingleResult();
//    }
}
