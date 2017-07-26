package business.logic;

import models.persistence.Bill;
import models.persistence.Room;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import security.Secured;
import util.Args;
import util.ClientMsg;
import util.Mapper;

import javax.inject.Inject;
import java.security.PublicKey;
import java.util.Map;

/** This class handles logic related to a bill.
 * Created by kip on 7/21/17.
 */
public class BillLogic {

    private static final Logger.ALogger logger = Logger.of(UserLogic.class);
    private final JPAApi jpaApi;
    private final Secured secured;
    private final Mapper mapper;
    private final RoomStatus roomStatus;
    private final CommonLogic commonLogic;

    @Inject
    public BillLogic(JPAApi jpaApi, Secured secured, Mapper mapper, RoomStatus roomStatus, CommonLogic commonLogic){
        this.jpaApi = jpaApi; this.secured = secured; this.mapper = mapper; this.roomStatus = roomStatus; this.commonLogic = commonLogic;
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
