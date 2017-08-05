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
import java.math.BigInteger;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static play.libs.Json.toJson;

/** This class handles the logic associated to a room
 * Created by kip on 7/21/17.
 */
public class RoomLogic {
    private static final Logger.ALogger logger = Logger.of(RoomLogic.class);
    private final JPAApi jpaApi;
    private final Mapper mapper;
    private final CommonLogic commonLogic;

    @Inject
    public RoomLogic(JPAApi jpaApi, Mapper mapper, CommonLogic commonLogic){
        this.jpaApi = jpaApi; this.mapper = mapper; this.commonLogic = commonLogic;
    }

    public Object apply(Map<Args,Object> args) {

        Object obj = args.get(Args.mappedObj);
        Room room = (Room)obj;
        Users user = commonLogic.getUser(args);
        Long parentId = room.getParentId();

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);

        logger.debug("Room - Action: "+action);
        if(action == Args.ACTIONS.EDIT){
            Building building = jpaApi.em().find(Building.class,parentId);
            //jpaApi.em().find()
            System.out.println("Building is: "+building);
            System.out.println(toJson(room));
            if(user.getRole().equalsIgnoreCase("landlord")){
                if(room.getId() == null){
                    room.setBuilding(building);
                    setOrder(room);
                    //NB: Don't change this persist to merge. It will cause problems.
                    jpaApi.em().persist(room);
                    building.addLandLordRoom(room);
                    return room;
                }else{
                    //We are updating this room. role of user is landlord
                    Room existing = jpaApi.em().find(Room.class,room.getId());
                    return this.mapper.mapFields(room,existing);

                }
            }else if(user.getRole().equalsIgnoreCase("tenant")){
                Room existing = jpaApi.em().find(Room.class,room.getId());
                //We are associating tenant with room. Associate with building as well.
                user.addApt(building);
                building.addUsers(user);

                building.addTenantRoom(existing);
                return building;
            }else{
                throw new IllegalStateException("Unrecognized role supplied"+user.getRole());
            }
        }else if(action == Args.ACTIONS.DELETE){

            room = jpaApi.em().find(Room.class,room.getId());

            if(user.getRole().equalsIgnoreCase("landlord")){

                //We are deleting the room.
                commonLogic.archiveUsers(room);
                jpaApi.em().remove(room);
                logger.debug("Room deleted: "+room.getName());
                //A null message will be interpreted on the front end as a success message, and no popup will ge generated by the mobile app.
                return new ClientMsg("",new ClientMsg(room.getId(),"deleted"));

            }else if(user.getRole().equalsIgnoreCase("tenant")){
                //We are dissociating user with room.
                Building building = room.getBuilding();
                building.getTenantRooms().remove(room);
                jpaApi.em().merge(building.getTenantRooms());
                //TODO: If we uncommment this block we will need to coordinate with front end to make sure building is taken out from list
                //TODO: and not room because the request was for taking out the room. So figure out how to do this coordination.
//                if(building.getTenantRooms().size() == 0){
//                    //If no more rooms for building, then remove building from tenant list
//                    user.removeApt(building);
//                    return new ClientMsg("",new ClientMsg(building.getId(),"deleted"));
//                }
                return new ClientMsg("",new ClientMsg(room.getId(),"deleted"));
            }
        }
        return obj;
    }
    private void setOrder(Room room) {
        if(room.getOrd() == null){
            room.setOrd((BigInteger) jpaApi.em().createNativeQuery("select nextval('ord_seq')").getResultList().get(0));
        }
    }
}
