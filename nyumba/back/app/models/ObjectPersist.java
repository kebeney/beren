package models;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import models.persistence.Building;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import play.libs.concurrent.HttpExecutionContext;
import play.mvc.Http;
import play.mvc.Result;
import security.ErenValidator;
import security.Secured;
import util.*;

import javax.persistence.EntityManager;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Executor;

import static play.libs.Json.toJson;
import static play.mvc.Http.Context.Implicit.request;
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
//    public Result apply(Http.Request req, Map<Args,Object> args){
//
//        //Retrieve expected arguments from client and put them in args map.
//        args = erenValidator.getArgs(req, args);
//        //if(true) return badRequest();
//        logger.debug(mapper.toJson(args.get(Args.data),args).toString());
//
//        //Validate and bind the form here
//        Object mappedObj = erenValidator.validate(types.handleType(args), args);
//
//        //Apply logic and persist the object.
//        args.put(Args.mappedObj,mappedObj);
//        mappedObj = types.handleType(args);
//
//        //Invoke the mapper only if mappedObj is not a ClientMsg. We are returning ClientMsg during new user signup.
//        if (mappedObj instanceof ClientMsg){
//            return ok(toJson(mappedObj));
//        }else{
//            //TODO: delete the loginSuccess message below...
//            return ok(mapper.toJson(new ClientMsg("Success",mappedObj),args));
//            //return ok(mapper.toJson(mappedObj,args));
//        }
//    }

//    public Result login(Http.Request req, Map<Args, Object> args) {
//        //Get expected arguments
//        args = erenValidator.getArgs(req, args,false);
//
//        //Validate and bind request to the user object
//        Users user = (Users)erenValidator.validate(types.handleType(args), args);
//
//        if(user == null) return badRequest(mapper.toJson(new ClientMsg("Invalid request."),args));
//
//        //Authenticate the mapped & validated user object
//        String userJson = secured.login(user, args);
//
////        if(user != null && user.getRole().equalsIgnoreCase("tenant")) {
////            user = this.mapper.mapTenant(user);
////        }
//        //If authenticator returns null, respond with unauthorized else respond with user data.
//        return userJson == null ? unauthorized("Invalid username or password") : ok(userJson);
//    }
//-----------------------------------------Async processing--------------------------------------------------------------

    public CompletionStage<Result> loginAsync(Http.Request req, final Map<Args, Object> args) {

 //       CompletionStage<Result> result = CompletableFuture.supplyAsync(() -> {

           logger.debug("Attempting to Authenticate");
            //Get expected arguments
            erenValidator.getArgs(req, args);

            //Validate and bind request to the user object
            Users user = (Users)erenValidator.validate(types.handleType(args), args);

//            if(user == null) return badRequest(mapper.toJson(new ClientMsg("Invalid request."),args));
        if(user == null) return CompletableFuture.supplyAsync(() -> ok(mapper.toJson(new ClientMsg("Invalid request."),args)) );

        //Authenticate the mapped & validated user object
        return secured.loginAsync(user, args).thenApply((result) -> {
            if (result == null){
                return unauthorized("Invalid username or password"); }
            else {
                return  ok(result);
            }
        });
    }

    public CompletionStage<Result> applyAsync(Http.Request req, final Map<Args,Object> args) {

        //Retrieve expected arguments from client and put them in args map.
        erenValidator.getArgs(req, args);
        //if(true) return badRequest();
        logger.debug(mapper.toJson(args.get(Args.data),args).toString());

        //Validate and bind the form here
        Object mappedObj = erenValidator.validate(types.handleType(args), args);

        //Apply logic and persist the object.
        args.put(Args.mappedObj,mappedObj);
        CompletionStage<Result> result = types.handleTypeAsync(args).thenApply((object) ->{
            //Invoke the mapper only if mappedObj is not a ClientMsg. We are returning ClientMsg during new user signup.

            if(object instanceof String){
                logger.debug("Returning: "+object);
                return ok((String)object);
            }else
            if (object instanceof ClientMsg){
                logger.debug("Returning: "+toJson(object));
                  return ok(toJson(object));
            }else{
                logger.debug("Returning: "+toJson(object));
                 return ok(mapper.toJson(new ClientMsg("Success",object),args));
            }
        });
        return result;
    }
}
