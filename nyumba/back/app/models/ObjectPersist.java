package models;

import com.google.inject.Inject;
import play.Logger;
import play.mvc.Http;
import play.mvc.Result;
import security.ErenValidator;
import security.Secured;
import util.*;

import java.util.Map;

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
        Object user = erenValidator.validate(types.handleType(args), args);

        if(user == null) return badRequest(mapper.toJson(new ClientMsg("Invalid request."),args));

        //Authenticate the mapped & validated user object
        user = secured.login(user, args);
        logger.debug("User is: "+user);

        //If authenticator returns null, respond with unauthorized else respond with user data.
        return user == null ? unauthorized("Invalid username or password") : ok(mapper.toJson(new ClientMsg("loginSuccess",user),args));
    }
}
