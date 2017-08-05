package business.logic;

import com.google.inject.Inject;
import models.persistence.Bill;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import util.Args;
import util.ClientMsg;
import util.Mapper;


import java.security.PublicKey;
import java.util.Map;

/** This class handles logic related to a bill.
 * Created by kip on 7/21/17.
 */
public class BillLogic {

    private static final Logger.ALogger logger = Logger.of(UserLogic.class);
    private final JPAApi jpaApi;
    private final PaymentApi paymentApi;
    private final RoomStatus roomStatus;
    private final CommonLogic commonLogic;

    @Inject
    public BillLogic(JPAApi jpaApi, PaymentApi paymentApi, RoomStatus roomStatus, CommonLogic commonLogic){
        this.jpaApi = jpaApi; this.paymentApi = paymentApi; this.roomStatus = roomStatus; this.commonLogic = commonLogic;
    }

    public Object apply(Map<Args,Object> args) {

        Args.ACTIONS action = (Args.ACTIONS)args.get(Args.action);   Object obj = args.get(Args.mappedObj);
        Bill payment = (Bill) obj;

        logger.debug("RoomDetail - Action: "+action);

        if(action == Args.ACTIONS.EDIT){
            if(payment.getId() == null){
                //New entry.
                Room room = jpaApi.em().find(Room.class, payment.getParentId());
                Users user = commonLogic.getUser(args);

                payment.setRoom(room);

                payment.setUser(user);
                //If user is a tenant, send request for processing to equity bank.
                if(user.getRole().equalsIgnoreCase("tenant")){
                    this.paymentApi.processPayment(payment);
                }
                //Otherwise if user is landlord/caretaker, then this is a manual entry. Save it to DB appropriately.
                payment = (Bill) roomStatus.updateBill(payment);

                jpaApi.em().persist(payment);
                user.addBill(payment);
                return payment;
            }else {
                //Existing entry cannot be modified. Advice client to make a new entry.
                return new ClientMsg("Payments Cannot be modified. Please create a new entry to balance off existing mismatch.");
            }
        }else if(action == Args.ACTIONS.DELETE){

            return new ClientMsg("Payments Cannot be deleted. Please create a new entry to balance off existing mismatch.");
        }
        return obj;
    }
}
