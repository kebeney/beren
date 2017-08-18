package business.logic;

import com.fasterxml.jackson.databind.JsonNode;
import models.payment.EquityBankPaymentVO;
import models.persistence.Bill;
import play.Configuration;
import play.Logger;
import play.db.jpa.JPAApi;
import play.libs.ws.WSClient;
import play.libs.ws.WSResponse;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletionStage;

import static play.libs.Json.toJson;
//TODO: convert all the deprecated classes
/** Class used to make web service calls to payment processing
 * Created by kip on 7/8/17.
 */
@Singleton
public class PaymentApi implements Runnable {
    private static final Logger.ALogger logger = Logger.of(PaymentApi.class);

    @Inject
    private WSClient ws;
    @Inject
    private Configuration configuration;

    private String access_token = null;
    private Instant token_expiry = null;

//    @Inject
//    public PaymentApi(JPAApi jpaApi){
//
//    }

    public void run(){
        this.getAccessToken();
    }

    public CompletionStage<String> processPayment(Bill bill){

        //String type, Long mobileNumber, Long auditNumber, BigDecimal amount, String description
        EquityBankPaymentVO equityBankPaymentVO = new EquityBankPaymentVO(
                bill.getType(),
                bill.getUser().getPhoneNo(),
                bill.getAuditNumber().toString(),
                bill.getAmt(),
                bill.getDescription());
        String reqBody = toJson(equityBankPaymentVO).toString();

        logger.debug("Sending to equity: "+reqBody);

        return sendPayment(getAccessToken(),reqBody).thenApply(res -> {

            String status = res.get("status") == null ?null:res.get("status").asText();
            if(status == null || !status.equalsIgnoreCase("success")){
                logger.debug("Payment not approved. Response is: "+res.toString());
            }
            return status;
        });
    }
    private CompletionStage<JsonNode> sendPayment(String access_token,String jsonBody){

        logger.debug("Sending payment...");

        Map<String,String> props = getProps(new String[]{"payments_url"});

        String authorizationHeaderValue = "Bearer "+access_token;

        return ws.url(props.get("payments_url"))
                .setHeader("Authorization",authorizationHeaderValue)
                .setHeader("Content-Type","application/json")
                .post(jsonBody).thenApply(WSResponse::asJson).exceptionally(ex -> {
                    logger.debug("Unable to process payment:",ex);
                    System.out.println("Unable to process payment:"+ex);
                    return null;
                });
    }
    private String getAccessToken(){
        Instant now = Instant.now().plusSeconds(61);
        if( token_expiry == null || access_token == null || token_expiry.isBefore(now)){
            return getNewToken().thenApply(tokenJson -> {

                logger.debug("Access token is:"+tokenJson.toString());

                try{
                    JsonNode token = tokenJson.get("access_token");
                    if( token == null){
                        logger.debug("Error trying to get access token: "+tokenJson.toString());
                    }else{
                        this.access_token = token.asText();
                        Long issued_at = tokenJson.get("issued_at").asLong();
                        Long expires_in = tokenJson.get("expires_in").asLong();
                        Long expiryMillis =  issued_at + (expires_in*1000);
                        this.token_expiry = Instant.ofEpochMilli(expiryMillis);
                    }
                }catch(Exception ex){
                    logger.error("Exception tyring to get equity access token: ",ex);
                }
                logger.debug("Token has been set:"+this.access_token);
               return access_token;
            }).toCompletableFuture().join();
        }else{
            LocalDateTime nowTime = LocalDateTime.ofInstant(now, ZoneId.systemDefault());
            LocalDateTime expireTime = LocalDateTime.ofInstant(token_expiry, ZoneId.systemDefault());
            logger.debug("Time now is:      "+nowTime);
            logger.debug("Token expires at: "+expireTime);
            return access_token;
        }
    }
    private CompletionStage<JsonNode> getNewToken(){

        logger.debug("Getting new access token...");

        Map<String,String> props = getProps(new String[]{"client_id", "client_secret", "username", "password", "grant_type", "token_url"});

        String authorizationHeaderValue = "Basic "+java.util.Base64.getEncoder().encodeToString((props.get("client_id")+":"+props.get("client_secret")).getBytes());

        //logger.debug("body is: "+"username="+props.get("username")+"&password="+props.get("password")+"&grant_type="+props.get("grant_type"));

        return ws.url(props.get("token_url"))
                .setHeader("Authorization",authorizationHeaderValue)
                .setHeader("Content-Type","application/x-www-form-urlencoded")
                .post(
                "username="+props.get("username")+"&password="+props.get("password")+"&grant_type="+props.get("grant_type")
                ).thenApply(WSResponse::asJson).exceptionally(ex -> {
                    logger.debug("Unable to get token:",ex);
                    return null;
                });
    }
    private Map<String, String> getProps(String[] props){
        logger.debug("Reading properties...");

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