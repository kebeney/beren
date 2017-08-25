package business.logic;

import models.persistence.Building;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import security.Secured;
import util.Args;
import util.ClientMsg;
import util.Mapper;

import javax.inject.Inject;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

import static play.libs.Json.toJson;

/** This class handles logic related to Building
 * Created by kip on 7/21/17.
 */
public class BuildingLogic {
    private static final Logger.ALogger logger = Logger.of(BuildingLogic.class);
    private final JPAApi jpaApi;
    private final Mapper mapper;
    private final CommonLogic commonLogic;

    @Inject
    public BuildingLogic(JPAApi jpaApi, Mapper mapper, CommonLogic commonLogic){
        this.jpaApi = jpaApi; this.mapper = mapper; this.commonLogic = commonLogic;
    }

    public Object apply(Map<Args,Object> args) {

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);   Object obj = args.get(Args.mappedObj);
        Building tmpBuilding = (Building)obj;
        Users user = commonLogic.getUser(args,jpaApi);

        logger.debug("Building - Action: "+action);
        if(action == Args.ACTIONS.EDIT){
            if(user.getRole().equalsIgnoreCase("landlord")){
                if(tmpBuilding.getId() == null){
                    //New building.
                    jpaApi.em().persist(tmpBuilding);
                    //Users user = jpaApi.em().find(Users.class,tmpBuilding.getParentId());
                    tmpBuilding.addUsers(user);
                    user.addApt(tmpBuilding);
                    jpaApi.em().merge(user);
                    return jpaApi.em().merge(tmpBuilding);
                }else{
                    //Updating the building
                    Building existing = jpaApi.em().find(Building.class,tmpBuilding.getId());
                    Object mappedObj = this.mapper.mapFields(tmpBuilding,existing);
                    return mapper.toJson(new ClientMsg(mappedObj),jpaApi);
                }
            }else{
                //Tenant tried to modify or create apt.
                return new ClientMsg("Action not permitted");
            }
        }else if(action == Args.ACTIONS.DELETE){

            Building existing = jpaApi.em().find(Building.class,tmpBuilding.getId());

            //If object was not found, just return confirmation.
            if(existing == null) return new ClientMsg("deleted",obj);

            logger.debug("Building: "+toJson(tmpBuilding).toString());
            logger.debug("Existing is: "+toJson(existing).toString());

            if(user.getRole().equalsIgnoreCase("tenant")){

                //First dissociate all rooms with the tenant.
                //existing.getTenantRooms().clear();
                //jpaApi.em().merge(existing);
                user.getTenantRooms().clear();
                jpaApi.em().merge(user);

                //Then dissociate the building with the tenant.
                user.removeApt(existing);
                jpaApi.em().merge(user);

            }else if(user.getRole().equalsIgnoreCase("landlord")){
                //Perform landlord logic
                for(Room r: existing.getLandlordRooms()){
                    this.commonLogic.archiveUsers(r);
                }
                for(Users u: existing.getUsers()){
                    u.removeApt(existing);
                }
                jpaApi.em().remove(existing);

            }else{
                throw new IllegalStateException("Role for given user was not found: "+user.getUsername());
            }

            //return new ClientMsg(existing.getId(),"deleted");
            return new ClientMsg("deleted",obj);
        }
        return obj;
    }

    public CompletionStage<Object> applyAsync(Map<Args, Object> args) {
        return CompletableFuture.supplyAsync(() -> jpaApi.withTransaction(() -> this.apply(args)));
    }
}
