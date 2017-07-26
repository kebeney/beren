package security;

import business.logic.CommonLogic;
import com.fasterxml.jackson.databind.JsonNode;
import models.persistence.person.Users;
import play.Logger;
import play.data.Form;
import play.data.FormFactory;
import play.mvc.Http;
import util.Args;
import util.ClientMsg;

import javax.inject.Inject;
import java.util.Map;

/**
 * Created by kip on 6/9/17.
 * Used to map request json to the corresponding form and to Validate objects
 */
public class ErenValidator<T> {
    private final FormFactory formFactory;
    private final Secured secured;
    private final CommonLogic commonLogic;
    private final Logger.ALogger logger = Logger.of(ErenValidator.class);

    @Inject
    public ErenValidator(FormFactory formFactory, Secured secured, CommonLogic commonLogic){
        this.secured = secured; this.commonLogic = commonLogic;
        this.formFactory = formFactory;
    }

    public Object validate(T t,Map<Args,Object> args){
        if(!validate(args)){
            return  new ClientMsg("Submitted form is invalid.");
        }
        Form form = formFactory.form(t.getClass()); //.bind((JsonNode)args.get("data")).get();
        t = (T)form.bind((JsonNode)args.get(Args.data)).get();
        logger.debug("Form has errors: "+form.hasErrors());
        if(form.hasErrors()){
            form.errors().forEach((k,v) -> {
                logger.debug("Key is: "+k+" value is: "+v);
            });
            logger.debug("Form has errors. Please check: "+t.getClass().getName());
            return new ClientMsg("Submitted form is invalid.");
        }
        return t;
    }

    /**
     * This function is used to retrieve arguments from the request body.
     * @param req Request that contains arguments from client
     * @return Map of arguments with expected values.
     */
    public Map <Args,Object> getArgs(Http.Request req, Map<Args,Object> args){
        JsonNode body = req.body().asJson();
        logger.debug("Body is: "+body.toString());
        //"classType" must not be put into this map at this point. It is used in the Types class to determine whet type of object should be mapped.
        //"data" represents the content being sent from front end - payload.
        args.put(Args.classType,body.get("type").asText());
        args.put(Args.data,body.get("data"));

        return getHeaderArgs(req,args);

    }

    public Map <Args,Object> getHeaderArgs(Http.Request req, Map<Args,Object> args){
        //role is the role of the user sending the request
        String[] jwt = req.headers().get("Authorization");
        String username = jwt == null? null: this.secured.getUserName(jwt[0]);
        if( username != null){
            args.put(Args.userName,username);
            args.put(Args.user,commonLogic.getUser(args));
        }else{
            logger.debug("User role is null");
        }
        return args;
    }

    private Boolean validate(Map<Args, Object> map){
        boolean returnVal = true;
        if(map.get(Args.action) == null || map.get(Args.action).toString().equalsIgnoreCase("")){
            logger.debug("Action  allowed to be empty. Action:"+map.get(Args.action));
        }
        if(map.get(Args.data) == null || !(map.get(Args.data) instanceof JsonNode )){
            logger.debug("Data cannot be null. data:"+map.get(Args.data));
            returnVal = false;
        }
        if(map.get(Args.classType) == null || map.get(Args.classType).toString().equalsIgnoreCase("")){
            logger.debug("Type cannot be null. Type:"+map.get(Args.classType));
            returnVal = false;
        }
        return returnVal;
    }
}
