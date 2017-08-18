package business.logic;

import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import security.Secured;
import util.Args;
import util.ClientMsg;
import util.Mapper;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

/**This class handles the logic regarding the actions associated to a user.
 * Created by kip on 7/21/17.
 */
public class UserLogic {
    private static final Logger.ALogger logger = Logger.of(UserLogic.class);
    private final JPAApi jpaApi;
    private final Secured secured;
    private final Mapper mapper;

    @Inject
    public UserLogic(JPAApi jpaApi, Secured secured, Mapper mapper){
        this.jpaApi = jpaApi; this.secured = secured; this.mapper = mapper;
    }
    public Object apply(Map<Args,Object> args) {

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);   Object obj = args.get(Args.mappedObj);

        logger.debug("Action is: "+action);
        Users tmpUser = (Users) obj ;
        if(action == Args.ACTIONS.EDIT){
            if(tmpUser.getId() == null){
                //New user object.
                //Ensure username does not yet exist
                int exists = jpaApi.em().createNamedQuery("select User by username").setParameter("username",tmpUser.getUsername()).getResultList().size();
                if( exists != 0) {
                    return new ClientMsg("Username: "+tmpUser.getUsername()+" already exists. Please choose another name.");
                }
                Users user = secured.encryptPassword(tmpUser);
                jpaApi.em().persist(user);
                return new ClientMsg("User creation successful! Please log in to proceed.");
            }else{
                //Existing user. Pull current user, and update it.Password reset should not be part of this flow.
                if(tmpUser.getPassword() != null){
                    logger.debug("Attempting to reset password through user update flow is not allowed.");
                    throw new UnsupportedOperationException();
                }
                Users existingUser = jpaApi.em().find(Users.class, tmpUser.getId());
                existingUser = (Users)this.mapper.mapFields(tmpUser,existingUser);
                this.jpaApi.em().persist(existingUser);
                Users returnObj = existingUser;
                if(existingUser.getRole().equalsIgnoreCase("tenant")){
                    returnObj = this.mapper.mapTenant(existingUser);
                }

                returnObj.setClaims(secured.getJWT(returnObj,new HashMap<>()));
                return mapper.toJson(new ClientMsg("loginSuccess",returnObj),args);
            }
            //jpaApi.em().merge(tmpUser);
            //Return encrypted object representing jwt. It will be turned to json after return.


            //return new UserWrap(tmpUser,secured.getJWT(tmpUser,new HashMap<>()));
        }
        else if(action == Args.ACTIONS.DELETE){
            //TODO: Implement the logic to delete user. First define use case for it.
            throw new UnsupportedOperationException("User deletions is currently unsupported. ");
        }
        return obj;
    }

    public CompletionStage<Object> applyAsync(Map<Args, Object> args) {
        return CompletableFuture.supplyAsync(()-> jpaApi.withTransaction(() -> this.apply(args)) );
    }
}
