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

        logger.debug("Building - Action: "+action);
        if(action == Args.ACTIONS.EDIT){

            if(tmpBuilding.getId() == null){
                //New building.
                jpaApi.em().persist(tmpBuilding);
                Users user = jpaApi.em().find(Users.class,tmpBuilding.getParentId());
                tmpBuilding.addUsers(user);
                user.addApt(tmpBuilding);
                jpaApi.em().merge(user);
                return jpaApi.em().merge(tmpBuilding);
            }else{
                //Updating the building
                Building existing = jpaApi.em().find(Building.class,tmpBuilding.getId());
                return this.mapper.mapFields(tmpBuilding,existing);
            }
        }else if(action == Args.ACTIONS.DELETE){
            Users initiator = jpaApi.em().find(Users.class,tmpBuilding.getParentId());
            Building existing = jpaApi.em().find(Building.class,tmpBuilding.getId());
           // building = jpaApi.em().find(Building.class,building.getId());

            logger.debug("Building: "+toJson(tmpBuilding).toString());
            logger.debug("Existing is: "+toJson(existing).toString());

            if(initiator.getRole().equalsIgnoreCase("tenant")){

                //First dissociate all rooms with the tenant.
                existing.getTanantRooms().clear();
                jpaApi.em().merge(existing);

                //Then dissociate the building with the tenant.
                initiator.removeApt(existing);
                jpaApi.em().merge(initiator);

            }else if(initiator.getRole().equalsIgnoreCase("landlord")){
                //Perform landlord logic
                for(Room r: existing.getLandLordRooms()){
                    this.commonLogic.archiveUsers(r);
                }
                for(Users u: existing.getUsers()){
                    u.removeApt(existing);
                }
                jpaApi.em().remove(existing);

            }else{
                throw new IllegalStateException("Role for given user was not found: "+initiator.getUsername());
            }

            //This has to be nested because of how the front end interprets the message. It needs to be inside the data field.
            return new ClientMsg("",new ClientMsg(existing.getId(),"deleted"));
        }
        return obj;
    }
}
