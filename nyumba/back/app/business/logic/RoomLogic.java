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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

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
        Users user = commonLogic.getUser(args,jpaApi);
        Long parentId = room.getParentId();

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);

        logger.debug("Room - Action: "+action);
        if(action == Args.ACTIONS.EDIT){
            Building building = jpaApi.em().find(Building.class,parentId);
            //jpaApi.em().find()
            logger.debug("Building is: "+building);
            logger.debug(toJson(room).toString());
            if(user.getRole().equalsIgnoreCase("landlord")){
                if(room.getId() == null){
                    room.setBuilding(building);
                    setOrder(room);
                    //NB: Don't change this persist to merge. It will cause problems.
                    jpaApi.em().persist(room);
                    building.addLandlordRoom(room);
                    return room;
                }else{
                    //We are updating this room. role of user is landlord
                    Room existingRoom = jpaApi.em().find(Room.class,room.getId());
                    return this.mapper.mapFields(room,existingRoom);

                }
            }else if(user.getRole().equalsIgnoreCase("tenant")){

                //We are associating room to the tenant user
                Room existing = jpaApi.em().find(Room.class,room.getId());

                user.addTenantRoom(existing);

                //Special case because we are receiving a Room model but we are returning a building back to caller.
                //TODO: Figure out how to do the mapping after tenant successful login. and test tenant delete of room
                Building tmpBuilding = new Building();
                tmpBuilding = (Building)this.mapper.mapFields(building,tmpBuilding);
                for(Room r: user.getTenantRooms()){
                    if(r.getBuilding().equals(building)){
                        tmpBuilding.addTenantRoom(r);
                    }
                }
                return mapper.toJson(new ClientMsg(tmpBuilding),args);
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
                return new ClientMsg("deleted",obj);

            }else if(user.getRole().equalsIgnoreCase("tenant")){
                //We are dissociating user with room.

                user.getTenantRooms().remove(room);
                //TODO: If we uncomment this block we will need to coordinate with front end to make sure building is taken out from list
                //TODO: as well if this was the last room in the building.

                return new ClientMsg("deleted",obj);
            }
        }
        return obj;
    }
    private void setOrder(Room room) {
        if(room.getOrd() == null){
            room.setOrd((BigInteger) jpaApi.em().createNativeQuery("select nextval('ord_seq')").getResultList().get(0));
        }
    }

    public CompletionStage<Object> applyAsync(Map<Args, Object> args) {
        return CompletableFuture.supplyAsync(() -> jpaApi.withTransaction(() -> this.apply(args)));
    }
}
