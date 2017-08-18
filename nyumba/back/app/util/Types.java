package util;

import business.logic.*;
import com.google.inject.Inject;
import models.persistence.Bill;
import models.persistence.Building;
import models.persistence.Room;
import models.persistence.person.Tenant;
import models.persistence.person.Users;
import play.Logger;
import java.util.Map;
import java.util.concurrent.CompletionStage;

/** This class provides the routing to the appropriate logic class based on a switch value set in a param sent from the client.
 * Created by kip on 5/12/17.
 */

public class Types {
    private static final Logger.ALogger logger = Logger.of(Types.class);
    private final UserLogic userLogic;
    private final BuildingLogic buildingLogic;
    private final  RoomLogic roomLogic;
    private final TenantLogic tenantLogic;
    private final BillLogic billLogic;

    @Inject
    public Types(BuildingLogic buildingLogic, UserLogic userLogic, RoomLogic roomLogic, TenantLogic tenantLogic, BillLogic billLogic){
        this.userLogic = userLogic; this.buildingLogic = buildingLogic; this.roomLogic = roomLogic; this.tenantLogic = tenantLogic; this.billLogic = billLogic;
    }

    //obj should be null the first time before request mapping happens. Otherwise we pass in an object to update.
    public Object handleType(Map<Args, Object> args){
        Object obj = args.get(Args.mappedObj);
        logger.debug("Types SWITCH - Action: "+args.get(Args.action));
        switch((String)args.get(Args.classType)){
            case "Building":
                return obj == null ? new Building() : buildingLogic.apply(args) ;
            case "Room":
                return obj == null ? new Room() : roomLogic.apply(args) ;
            case "RoomDetails":
            case "Payment":
            case "Bill":
                return obj == null ? new Bill() : billLogic.apply(args) ;
            case "Tenant":
                return obj == null ? new Tenant() : tenantLogic.apply(args) ;
            case "User":
                return obj == null ? new Users() : userLogic.apply(args) ;
            default:
                String message = "No class of type \""+args.get(Args.classType)+"\" was found. Please add "+args.get(Args.classType)+" to Types.java class";
                logger.debug(message);
                throw new IllegalArgumentException(message);
        }
    }
    public CompletionStage<Object> handleTypeAsync(Map<Args,Object> args){

        Object obj = args.get(Args.mappedObj);
        logger.debug("Types SWITCH - Action: "+args.get(Args.action));
        switch((String)args.get(Args.classType)){
            case "Building":
                return buildingLogic.applyAsync(args) ;
            case "Room":
                return roomLogic.applyAsync(args) ;
            case "RoomDetails":
            case "Payment":
            case "Bill":
                return billLogic.applyAsync(args) ;
            case "Tenant":
                return tenantLogic.applyAsync(args) ;
            case "User":
                return userLogic.applyAsync(args) ;
            default:
                String message = "No class of type \""+args.get(Args.classType)+"\" was found. Please add "+args.get(Args.classType)+" to Types.java class";
                logger.debug(message);
                throw new IllegalArgumentException(message);
        }

    }
}
