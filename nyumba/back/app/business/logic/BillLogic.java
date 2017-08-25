package business.logic;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import models.persistence.Bill;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import util.Args;
import util.ClientMsg;
import util.Mapper;


import java.math.BigDecimal;
import java.security.PublicKey;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

/** This class handles logic related to a bill.
 * Created by kip on 7/21/17.
 */
public class BillLogic {

    private static final Logger.ALogger logger = Logger.of(BillLogic.class);
    private final JPAApi jpaApi;
    private final PaymentApi paymentApi;
    private final RoomStatus roomStatus;
    private final CommonLogic commonLogic;

    @Inject
    public BillLogic(JPAApi jpaApi, PaymentApi paymentApi, RoomStatus roomStatus, CommonLogic commonLogic){
        this.jpaApi = jpaApi; this.paymentApi = paymentApi; this.roomStatus = roomStatus; this.commonLogic = commonLogic;
    }

    public CompletionStage<Object> apply(Map<Args,Object> args) {

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);   Object obj = args.get(Args.mappedObj);
        Bill payment = (Bill) obj;

        logger.debug("RoomDetail - Action: "+action);

        if(action == Args.ACTIONS.EDIT){
            if(payment.getId() == null){
                //New entry.
                Room room = jpaApi.em().find(Room.class, payment.getParentId());
                Users user = commonLogic.getUser(args,jpaApi);

                UUID uuid = UUID.randomUUID();
                payment.setAuditNumber(uuid);
                payment.setRoom(room);
                payment.setUser(user);

                //If user is a tenant, send request for processing to equity bank.
                if(user.getRole().equalsIgnoreCase("tenant")){

                    payment.setType("debit");

                    String status = this.paymentApi.processPayment(payment).toCompletableFuture().join();

                    if(status != null && status.equalsIgnoreCase("success")){

                        //The tenant account is going to be debited
                        payment.setStatus("Approved");
                        jpaApi.em().persist(payment);
                        roomStatus.updateBill(payment,jpaApi);
                        user.addBill(payment);
                        return  CompletableFuture.completedFuture(payment);
                    }else{
                        String msg = "";
                        //The tenant account is going to be debited
                        if(status == null){
                            payment.setStatus("Error");
                            msg = "Server error. Please try later";
                        }else{
                            payment.setStatus("Declined");
                            msg = "Payment declined. Please verify details";
                        }
                        jpaApi.em().persist(payment);
                        BigDecimal declinedAmt = payment.getAmt();
                        payment.setAmt(new BigDecimal(0));
                        roomStatus.updateBill(payment,jpaApi);
                        payment.setAmt(declinedAmt);
                        jpaApi.em().merge(payment);
                        user.addBill(payment);
                        jpaApi.em().merge(user);
                        return CompletableFuture.completedFuture(new ClientMsg(msg));
                    }

                }else if(user.getRole().equalsIgnoreCase("landlord")){
                    //Perform landlord logic
                    payment.setStatus("ME");
                    payment.setType("landlord");
                    jpaApi.em().persist(payment);
                    //Otherwise if user is landlord/caretaker, then this is a manual entry. Save it to DB appropriately.
                    payment = (Bill) roomStatus.updateBill(payment);
                    user.addBill(payment);
                    return CompletableFuture.completedFuture(payment);
                }
                else{
                    throw new IllegalStateException("Unrecognized role: "+user.getRole());
                }

            }else {
                //Existing entry cannot be modified. Advice client to make a new entry.
                return CompletableFuture.completedFuture(new ClientMsg("Payments Cannot be modified. Please create a new entry to balance off existing mismatch."));
            }
        }else if(action == Args.ACTIONS.DELETE){

            return CompletableFuture.completedFuture(new ClientMsg("Payments Cannot be modified. Please create a new entry to balance off existing mismatch."));
        }
        return CompletableFuture.completedFuture(obj);
    }

    public CompletionStage<Object> applyAsync(Map<Args, Object> args) {
        return jpaApi.withTransaction(() -> this.apply(args));
    }
}
