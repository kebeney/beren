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
            Building existing = jpaApi.em().find(Building.class,tmpBuilding.getId());
           // building = jpaApi.em().find(Building.class,building.getId());

            logger.debug("Building: "+toJson(tmpBuilding).toString());
            logger.debug("Existing is: "+toJson(existing).toString());

            for(Room r: existing.getRooms()){
                this.commonLogic.archiveUsers(r);
            }
            for(Users u: existing.getUsers()){
                u.removeApt(existing);
            }
            jpaApi.em().remove(existing);
            //This has to be nested because of how the front end interprets the message. It has to be inside the data field.
            return new ClientMsg("",new ClientMsg(existing.getId(),"deleted"));
        }
        return obj;
    }
}
