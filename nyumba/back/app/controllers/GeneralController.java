package controllers;

import com.google.inject.Inject;
import models.ObjectPersist;
import models.ObjectRetrieve;
import play.Logger;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;
import security.Secured;
import util.Args;
import util.ClientMsg;

import java.util.HashMap;
import java.util.Map;

import static play.libs.Json.toJson;

/** This controller handles all the requests and routes them accordingly.
 * Created by kip on 5/12/17.
 */
public class GeneralController extends Controller {

    private static final Logger.ALogger logger = Logger.of(GeneralController.class);
    private final ObjectPersist objectPersist;
    private final ObjectRetrieve objectRetrieve;

    @Inject
    public GeneralController(ObjectPersist objectPersist, ObjectRetrieve objectRetrieve){
        this.objectPersist = objectPersist;
        this.objectRetrieve = objectRetrieve;
    }

    @Transactional
    @Security.Authenticated(Secured.class)
    public Result handleSearchRequest(String model, String searchString){

        Map<Args,Object> args = new HashMap<>();
        args.put(Args.classType,model);
        return objectRetrieve.applySearch(request(),searchString,args);
    }

    @Transactional
    @Security.Authenticated(Secured.class)
    public Result handleGetRequest(String model, Long parentId){

        Map<Args,Object> args = new HashMap<>();
        args.put(Args.classType,model);
        return objectRetrieve.apply(request(),parentId,args);
    }

    @Transactional
    @Security.Authenticated(Secured.class)
    public Result handleAddRequest() {
        return this.handlePostRequest(Args.ACTIONS.EDIT);
    }

    @Transactional
    @Security.Authenticated(Secured.class)
    public Result handleEditRequest() {
        return this.handlePostRequest(Args.ACTIONS.EDIT);
    }

    @Security.Authenticated(Secured.class)
    @Transactional
    public Result handleDeleteRequest(){
        return this.handlePostRequest(Args.ACTIONS.DELETE);
    }

    //--------------------------Unauthenticated requests--------------------------------------
    @Transactional
    public Result signup(){
        return this.handlePostRequest(Args.ACTIONS.EDIT);
    }

    @Transactional
    public Result login() {
        logger.debug("Attempting login...");
        Map<Args,Object> args = new HashMap<>();
        return objectPersist.login(request(), args);
    }
    //--------------------------Unauthenticated requests--------------------------------------

    @Transactional
    private Result handlePostRequest(Args.ACTIONS action){
        Map<Args,Object> args = new HashMap<>();
        args.put(Args.action,action);
        Result result = badRequest("Something went wrong. Please verify info and try again .");
        try{
            result = objectPersist.apply(request(), args);
        }catch(Exception e){
            e.printStackTrace();
            logger.debug(result.toString());
        }
        return result;
    }
}
