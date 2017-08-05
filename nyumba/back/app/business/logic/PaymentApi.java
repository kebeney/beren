package business.logic;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import models.persistence.Bill;
import play.Configuration;
import play.Logger;
import play.db.jpa.JPAApi;
import play.libs.ws.WSClient;
import play.libs.ws.WSResponse;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletionStage;

/** Class used to make web service calls to payment processing
 * Created by kip on 7/8/17.
 */
@Singleton
public class PaymentApi implements Runnable {
    private static final Logger.ALogger logger = Logger.of(PaymentApi.class);

    @Inject
    WSClient ws;
    @Inject
    Configuration configuration;

    @Inject
    JPAApi jpaApi;

    private String access_token = null;
    private Instant token_expiry = null;

//    @Inject
//    public PaymentApi(JPAApi jpaApi){
//
//    }

    public void run(){
        Instant now = Instant.now().plusSeconds(61);
        if( token_expiry == null || access_token == null || token_expiry.isBefore(now)){
            getAccessToken();
        }else{

            LocalDateTime nowTime = LocalDateTime.ofInstant(now, ZoneId.systemDefault());
            LocalDateTime expireTime = LocalDateTime.ofInstant(token_expiry, ZoneId.systemDefault());
            logger.debug("Time now is:      "+nowTime);
            logger.debug("Token expires at: "+expireTime);
        }
    }
    public void processPayment(Bill bill){
        //TODO: Get back to the payment API.
        jpaApi.withTransaction(() -> {
            EntityManager em = jpaApi.em();
        });
    }
    private void getAccessToken(){


        Map<String,String> props = getProps(new String[]{"client_id", "client_secret", "username", "password", "grant_type", "token_url"});

        String authorizationHeaderValue = "Basic "+java.util.Base64.getEncoder().encodeToString((props.get("client_id")+":"+props.get("client_secret")).getBytes());

        //logger.debug("body is: "+"username="+props.get("username")+"&password="+props.get("password")+"&grant_type="+props.get("grant_type"));

        CompletionStage<JsonNode> result = ws.url(props.get("token_url"))
                .setHeader("Authorization",authorizationHeaderValue)
                .setHeader("Content-Type","application/x-www-form-urlencoded")
                .post(
                "username="+props.get("username")+"&password="+props.get("password")+"&grant_type="+props.get("grant_type")
                ).thenApply(WSResponse::asJson).whenComplete((res,err) -> {

            if(err != null || res == null){
                logger.error("Error trying to get equity access token: ",err);
            }else{
                try{
                    JsonNode token = res.get("access_token");
                    if( token == null){
                        logger.debug("Error trying to get access token: "+res.toString());
                    }else{
                        this.access_token = token.asText();
                        Long issued_at = res.get("issued_at").asLong();
                        Long expires_in = res.get("expires_in").asLong();
                        Long expiryMillis =  issued_at + (expires_in*1000);
                        this.token_expiry = Instant.ofEpochMilli(expiryMillis);
                    }
                }catch(Exception ex){
                    logger.error("Exception tyring to get equity access token: ",ex);
                }
            }
        });
    }
    private Map<String, String> getProps(String[] props){

        Map<String,String> propsMap = new HashMap<>();

        for(String prop: props){
            String tmpProp = this.configuration.getString("equity."+prop);
            if(tmpProp ==null || tmpProp.equalsIgnoreCase("")){
                logger.error("Invalid Property - "+prop+":"+tmpProp);
                throw new IllegalStateException("Supplied Property is not valid: "+prop);
            }else{
                propsMap.put(prop,tmpProp);
            }
        }
        return propsMap;
    }
}