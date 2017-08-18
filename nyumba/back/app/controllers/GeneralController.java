package controllers;

import com.google.inject.Inject;
import mail.SendMail;
import models.ObjectPersist;
import models.ObjectRetrieve;
import play.Logger;
import play.db.jpa.JPAApi;
import play.db.jpa.Transactional;
import play.libs.concurrent.HttpExecutionContext;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;
import security.Secured;
import util.Args;
import util.ClientMsg;

import javax.annotation.processing.Completion;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

import static play.libs.Json.toJson;

/** This controller handles all the requests and routes them accordingly.
 * Created by kip on 5/12/17.
 */
public class GeneralController extends Controller {

    private static final Logger.ALogger logger = Logger.of(GeneralController.class);
    private final ObjectPersist objectPersist;
    private final ObjectRetrieve objectRetrieve;
    private final SendMail sendMail;

    @Inject
    public GeneralController(ObjectPersist objectPersist, ObjectRetrieve objectRetrieve, HttpExecutionContext ec, SendMail sendMail){
        this.objectPersist = objectPersist;
        this.objectRetrieve = objectRetrieve;
        this.sendMail  = sendMail;
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

    @Security.Authenticated(Secured.class)
    public CompletionStage<Result> handleAddRequest() {
        Map<Args,Object> args = new HashMap<>();
        args.put(Args.action,Args.ACTIONS.EDIT);
        return this.handlePostRequestAsync(args);
    }

    @Security.Authenticated(Secured.class)
    public CompletionStage<Result> handleEditRequest() {
        Map<Args,Object> args = new HashMap<>();
        args.put(Args.action,Args.ACTIONS.EDIT);
        return this.handlePostRequestAsync(args);
    }

    @Security.Authenticated(Secured.class)
    public CompletionStage<Result> handleDeleteRequest(){
        Map<Args,Object> args = new HashMap<>();
        args.put(Args.action,Args.ACTIONS.DELETE);
        return this.handlePostRequestAsync(args);
    }

    //--------------------------Unauthenticated requests--------------------------------------
    public CompletionStage<Result> signup(){
        Map<Args,Object> args = new HashMap<>();
        args.put(Args.skipHeader,true);
        args.put(Args.action,Args.ACTIONS.EDIT);
        return this.handlePostRequestAsync(args);
    }

    public CompletionStage<Result> login() {
        this.handleSendMail();
        logger.debug("Attempting login...");
        Map<Args,Object> args = new HashMap<>();
        return objectPersist.loginAsync(request(),args);

    }
    //--------------------------Unauthenticated requests--------------------------------------

//    @Transactional
//    private Result handlePostRequest(Args.ACTIONS action){
//        Map<Args,Object> args = new HashMap<>();
//        args.put(Args.action,action);
//        Result result = badRequest("Something went wrong. Please verify info and try again .");
//        try{
//            result = objectPersist.apply(request(), args);
//        }catch(Exception e){
//            e.printStackTrace();
//            logger.debug(result.toString());
//        }
//        return result;
//    }

    //-------------------------Async post handler------------------------------------------------
    @Transactional
    private CompletionStage<Result> handlePostRequestAsync(Map<Args,Object> args){
        return objectPersist.applyAsync(request(), args).exceptionally((ex) -> {
            ex.printStackTrace();
            logger.debug(ex.toString());
            return badRequest("Something went wrong. Please verify info and try again .");
        });
    }

    public CompletionStage<Result> handleSendMail(){
        return sendMail.apply();
    }
}
