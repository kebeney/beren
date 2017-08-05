package models;

import business.logic.CommonLogic;
import com.google.inject.Inject;
import models.persistence.Building;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import play.mvc.Http;
import play.mvc.Result;
import security.ErenValidator;
import util.Args;
import util.ClientMsg;
import util.Mapper;
import util.Types;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static play.libs.Json.toJson;
import static play.mvc.Results.ok;

/** This class is used for object retrieval mainly search queries.
 * NB: The named queries are found in the respective objects e.g user, building, room, e.t.c objects
 * Created by kip on 5/13/17.
 */
public class ObjectRetrieve {
    private static final Logger.ALogger logger = Logger.of(ObjectRetrieve.class);
    private final JPAApi jpaApi;
    private final Types types;
    private final Mapper mapper;
    private final CommonLogic commonLogic;
    private final ErenValidator erenValidator;

    @Inject
    public ObjectRetrieve(JPAApi jpaApi, Types types, Mapper mapper, CommonLogic commonLogic, ErenValidator erenValidator){
        this.jpaApi = jpaApi; this.types = types; this.mapper = mapper; this.commonLogic = commonLogic; this.erenValidator = erenValidator;
    }

    public Result apply(Http.Request req, Long parentId, Map<Args, Object> args) {

        logger.debug("Type:"+args.get(Args.classType)+" parentId: "+parentId);
        //NB: Don't call the validator here. We don't need to validate anything because the get request does not have a body.
        //args = erenValidator.getArgs(req,args);
        List result = null;

        if(parentId == null){
            //If parentId is null, then we are selecting all parents
            result = jpaApi.em().createQuery("select r from "+types.handleType(args).getClass().getSimpleName()+" r ").getResultList();
        }else{
            result = jpaApi.em().createNamedQuery("select "+types.handleType(args).getClass().getSimpleName()+" by parentId").setParameter("parentId",parentId).getResultList();

        }
//        Users user = (Users)args.get(Args.user);
//        if(user.getRole().equalsIgnoreCase("tenant") && result.size() > 0){
//            if(result.get(0) instanceof Building){
//                for(Object b: result){
//                    ((Building)b).setRooms(((Building)b).getSelectedRooms());
//                }
//            }else if(result.get(0) instanceof Users){
//                List<Users> users = (List<Users>)result;
//                for(Users u: users){
//                    for(Building b: u.getApts()){
//                        b.setRooms(b.getSelectedRooms());
//                    }
//                }
//            }
//        }
        return ok(mapper.toJson(new ClientMsg("",result),args));
    }

    public Result applySearch(Http.Request req, String searchString, Map<Args, Object> args){

        //NB: During search, you want to return the actual rooms. Not selected rooms.
        args = erenValidator.getHeaderArgs(req,args);

        logger.debug("Type: "+args.get(Args.classType)+"   search string: "+searchString);

        List results = jpaApi.em().createNamedQuery("search Building match anyColumn")
                .setParameter("searchString","%"+searchString+"%")
                .setFirstResult(0).setMaxResults(20).getResultList();
        return ok(mapper.toJson(new ClientMsg("",results),args));
    }
}
