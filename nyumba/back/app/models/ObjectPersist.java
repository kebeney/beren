package models;

import com.google.inject.Inject;
import models.persistence.Building;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.mvc.Http;
import play.mvc.Result;
import security.ErenValidator;
import security.Secured;
import util.*;

import java.util.*;

import static play.libs.Json.toJson;
import static play.mvc.Results.*;

/** Class used to step through the process to apply necessary logic to the submitted object.
 * Created by kip on 5/12/17.
 */
public class ObjectPersist {
    private static final Logger.ALogger logger = Logger.of(ObjectPersist.class);
    private final Types types;
    private final ErenValidator erenValidator;
    private final Secured secured;
    private final Mapper mapper;

    @Inject
    public ObjectPersist(Types types,ErenValidator erenValidator,Secured secured, Mapper mapper)
    {
        this.types = types; this.erenValidator = erenValidator; this.secured = secured; this.mapper = mapper;
    }
    public Result apply(Http.Request req, Map<Args,Object> args){

        //Retrieve expected arguments from client and put them in args map.
        args = erenValidator.getArgs(req, args);
        //if(true) return badRequest();
        logger.debug(mapper.toJson(args.get(Args.data),args).toString());

        //Validate and bind the form here
        Object mappedObj = erenValidator.validate(types.handleType(args), args);

        //Apply logic and persist the object.
        args.put(Args.mappedObj,mappedObj);
        mappedObj = types.handleType(args);

        //Invoke the mapper only if mappedObj is not a ClientMsg. We are returning ClientMsg during new user signup.
        if (mappedObj instanceof ClientMsg){
            return ok(toJson(mappedObj));
        }else{
            return ok(mapper.toJson(new ClientMsg("loginSuccess",mappedObj),args));
            //return ok(mapper.toJson(mappedObj,args));
        }
    }

    public Result login(Http.Request req, Map<Args, Object> args) {
        //Get expected arguments
        args = erenValidator.getArgs(req, args);

        //Validate and bind request to the user object
        Users user = (Users)erenValidator.validate(types.handleType(args), args);

        if(user == null) return badRequest(mapper.toJson(new ClientMsg("Invalid request."),args));

        //Authenticate the mapped & validated user object
        user = secured.login(user, args);

        if(user != null && user.getRole().equalsIgnoreCase("tenant")) {
            user = this.mapTenant(user);
        }
        //If authenticator returns null, respond with unauthorized else respond with user data.
        return user == null ? unauthorized("Invalid username or password") : ok(mapper.toJson(new ClientMsg("loginSuccess",user),args));
    }
    private Users mapTenant(Users user){
        Set<Room> rooms = user.getTenantRooms();
        List<Building> apts = new ArrayList();

        //For each room
        for(Room r: rooms){
            //Find building and add room.
            Building building;
            int idx = apts.indexOf(r.getBuilding());
            //If building is not in the array yet, create it and put it into array.
            if(idx < 0){
                building = new Building();
                building = (Building)this.mapper.mapFields(r.getBuilding(),building);

                apts.add(building);
            }else{
                building = apts.get(idx);
            }
            building.addTenantRoom(r);
        }

        Set<Building> buildings = new HashSet<>();
        buildings.addAll(apts);
        Users user1 = new Users();
        user1 = (Users)mapper.mapFields(user,user1);
        user1.setApts(buildings);
        if(user1.getId() == null){
            throw new IllegalStateException("Mapping did not work properly. Please check what is wrong with the mapping...");
        }
        return user1;
    }
}
