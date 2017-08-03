package security;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import io.jsonwebtoken.*;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Configuration;
import play.Logger;
import play.db.jpa.JPAApi;
import play.mvc.Http;
import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;
import util.Args;
import util.ClientMsg;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.persistence.TypedQuery;
import java.math.BigInteger;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

import static play.libs.Json.toJson;

/**This class provides two main related functions. 1. Authenticating requests. 2. User login and token generations upon successful login.
 * Created by kip on 5/31/17.
 */
public class Secured extends Security.Authenticator{

    private static final Logger.ALogger logger = Logger.of(Secured.class);

    private final JPAApi jpaApi;
    private final Configuration config;
    private final SecureRandom secureRandom = new SecureRandom();

    @Inject
    public Secured(JPAApi jpaApi, Configuration config){
        this.jpaApi = jpaApi; this.config = config;
    }

    @Override
    public String getUsername(Context ctx) {

        JsonNode authHeader = getAuthorizationHeader(ctx.request().headers().get("Authorization")[0]);

        String username = authHeader == null? null:authHeader.get("sub") == null ? null:authHeader.get("sub").toString();

        if(username == null){
            logger.debug("Authentication failed from: "+ctx.request().headers().get("Origin")[0]);
        }
        return username;
    }

    @Override
    public Result onUnauthorized(Context ctx) {
        logger.debug("Returning unAuthorized to: "+ctx.request().headers().get("Origin")[0]);
        return unauthorized("tokenExp");
    }
    public String getUserName(String jwt){
        JsonNode body = this.getAuthorizationHeader(jwt);
        return body == null? null: body.get("sub") == null ? null: body.get("sub").asText();
    }

//    public String getRole(String jwt){
//        JsonNode body = this.getAuthorizationHeader(jwt);
//        return body == null? null: body.get("role") == null ? null: body.get("role").asText();
//    }

    public JsonNode getAuthorizationHeader(String jwt){
        JsonNode tokenBody = null;
        //This is a Bearer token even though it is not indicated in the header.
        Key key = KeyPairReadWrite.getSingleKey("single.key.file");

        try{
            Jws jwtClaims = Jwts.parser().setSigningKey(key).parseClaimsJws(jwt);
            tokenBody = toJson(jwtClaims.getBody());

        }catch(ExpiredJwtException | NullPointerException eje){
            logger.debug("Exception parsing claims: ",eje);
        }
        return tokenBody;
    }

    public Users login(Object obj, Map<Args, Object> args) {
        if(obj instanceof Users){
            Users user = (Users)obj;

            TypedQuery<Users> userQuery = jpaApi.em().createNamedQuery("select User by username", Users.class);
            userQuery.setParameter("username",user.getUsername());
            List<Users> list = userQuery.getResultList();
            if(list.size() > 1){
                logger.debug("Error: Found more than one user with username: "+user.getUsername());
                throw new IllegalStateException("Server error. Please try later");
            }
            else if(list.size() == 0){
                //User not found
                return null;
            } logger.debug("Size of user list is: "+list.size());
            Users pulledUser = list.get(0);
            byte [] hashedPwd = hashPassword(user.getPassword(),pulledUser.getSalt(),config.getInt("db.default.pwd.iterations"));

            if(Arrays.equals(pulledUser.getHash(),hashedPwd)){
                //Login successful. Filter the pulled user and return it.
                pulledUser.setClaims(getJWT(pulledUser,new HashMap<>()));
//                pulledUser.setPassword(null);
//                pulledUser.setSalt(null);
//                pulledUser.setHash(null);
                args.put(Args.role,pulledUser.getRole());
                args.put(Args.user,pulledUser);

                if(pulledUser.getRole().equalsIgnoreCase("tenant")){

//                    pulledUser.getApts().forEach(a -> {
//                        logger.debug("Rooms count: "+a.getRooms().size());
//                        logger.debug("Selected Rooms count: "+a.getSelectedRooms().size());
//                        //-----------------------------------------------------------------------------------------
//                        a.getRooms().clear();
//                        a.getRooms().addAll(a.getSelectedRooms());
//                        //-----------------------------------------------------------------------------------------
//                        a.getSelectedRooms().clear();
//                    });
                }
                return pulledUser;
            }
            return null;
        }
        else{
            logger.debug("Error: Wrong object. Expected User but found : "+obj.getClass().getName());
            throw new IllegalStateException("Server Error. Please try later");
        }
    }
    private byte[] hashPassword( final char[] password, final byte[] salt, final int iterations) {
        try {
            SecretKeyFactory skf = SecretKeyFactory.getInstance( "PBKDF2WithHmacSHA512" );
            PBEKeySpec spec = new PBEKeySpec( password, salt, iterations, 128 );
            SecretKey key = skf.generateSecret( spec );

            return key.getEncoded();

        } catch( NoSuchAlgorithmException | InvalidKeySpecException e ) {
            logger.debug("Error hashing password",e);
            throw new RuntimeException( e );
        }
    }
    public Map <String,Object> getJWT(Users user, Map<String,Object> auth){
        // String[] header =  {"typ:JWT","alg:HS512"} ;
        Claims claims = Jwts.claims().setSubject(user.getUsername());
        claims.put("role", user.getRole());
        ZonedDateTime zonedDateTime = ZonedDateTime.now(ZoneOffset.UTC).plusSeconds(config.getInt("play.http.session.maxAge"));
        Long millis = Date.from(zonedDateTime.toInstant()).getTime();
        claims.setExpiration(new Date(millis));
        //claims.setIssuer("http://localhost:9000");

        Key key = KeyPairReadWrite.getSingleKey("single.key.file");
        String compactJws = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, key).compact();

        auth.put("access_token",compactJws);
        auth.put("exp", millis);
        auth.put("role",user.getRole());
        auth.put("username",user.getUsername());
        return auth;
    }
    /**
     * Used by the Types class during new user creation to encrypt the password and set the hash and salt values in the user object
     * @param user User object for which the password should encrypted.
     * @return User object that now contains the password and salt
     */
    public Users encryptPassword(Users user){
        //Encrypt password here
        if(user.getPassword() != null){
            byte [] salt = new BigInteger(90, secureRandom).toString(32).getBytes();
            user.setHash(hashPassword(user.getPassword(),salt,config.getInt("db.default.pwd.iterations")));
            user.setSalt(salt);
        }
        return user;
    }
}