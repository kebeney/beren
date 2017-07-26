package business.logic;

import com.google.inject.Inject;
import models.persistence.Bill;
import models.persistence.Room;
import models.persistence.person.Person;
import models.persistence.person.Tenant;
import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;

import javax.persistence.Query;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.Period;
import java.time.ZonedDateTime;
import java.util.GregorianCalendar;
import java.util.SortedSet;
import java.util.TimeZone;

/**
 * Created by kip on 5/9/17.
 */
public class RoomStatus implements Runnable{

    private static final Logger.ALogger logger = Logger.of(RoomStatus.class);
    private final JPAApi jpaApi;

    public RoomStatus(){
        jpaApi = null;
    }

    @Inject
    public RoomStatus(JPAApi jpaApi){
        this.jpaApi = jpaApi;
    }
    public void run(){
        jpaApi.withTransaction(()->{
            monthlyBill();
        });

    }

    public Object updateBill(Object arg) {
//        Bill newBill = new Bill();
//        TypedQuery<Bill> query = jpaApi.em().createQuery("SELECT b FROM Bill b WHERE b.room = :room order by b.txnTmEpochMilli desc ", Bill.class);
        if (arg instanceof Bill){
            Bill bill = (Bill)arg;
            SortedSet<Bill> bills = bill.getRoom().getBills();
            for(Bill mBill: bills){
                logger.debug(mBill.getBal()+":"+mBill.getAmt()+":"+mBill.getRcpt());
            }
           // Bill last = bill.getRoom().getBills().last();
            logger.debug("Bills is: "+bills);
            if(bills != null && bills.size() > 0){
                bill.setBal(bills.last().getBal().subtract(bill.getAmt()));
                logger.debug("In if");
                logger.debug("New Bill balance is: "+bill.getBal());
            }else{
                bill.setBal(new BigDecimal(0).subtract(bill.getAmt()));
                logger.debug("In else:");
                logger.debug("New Bill balance is: "+bill.getBal());
            }
//            query.setParameter("room", bill.getRoom());
//            List<Bill> bills = query.getResultList();
//            if(bills.size() > 0){
//                newBill.setBal(bills.get(0).getBal().subtract(bill.getAmt()));
//            }else{
//                //New entry. Putting in bill for first time and tenant is not billed yet. Payment ahead of time
//                newBill.setBal(new BigDecimal(0).subtract(bill.getAmt()));
//            }
            //newBill.setPaidBy(bill.getPaidBy());
            //newBill.setAmt(bill.getAmt());
            //newBill.setRoom(bill.getRoom());
            bill.setType("Paid");
            //newBill.setRcpt(bill.getRcpt());
            //newBill.setPmtDtEpochMilli(bill.getPmtDtEpochMilli());
            bill.setTxnTmEpochMilli(Instant.now().toEpochMilli());
            setStatus(bill);
            return bill;
        } else if(arg instanceof Person){
            Tenant person = (Tenant) arg;
            logger.debug("room is: "+person.getRoom());
            if(person.getRoom().getState() != null && person.getRoom().getState().equalsIgnoreCase("occupied")){
                //We only apply a bill if this is the first occupant in the room. Otherwise we depend on monthly cycles to bill.
                return arg;
            }
            person.getRoom().setState("occupied");
            SortedSet<Bill> bills = person.getRoom().getBills();
            ZonedDateTime leaseStart = ZonedDateTime.parse(person.getLeaseStart());
            BigDecimal dueRent = person.getRoom().getRent();
            BigDecimal balance = null;
            if(person.getProrate()){
                dueRent = getProratedRent(dueRent, leaseStart);
            }
            if(bills != null && bills.size() > 0){
                //Room was paid for before registering tenant for first time. Now we are registering tenant so we bill as well.
                balance = bills.last().getBal().add(dueRent);
            }else{
                //New entry. Putting in bill for first time and tenant started occupying before paying
                balance = new BigDecimal(0).add(dueRent);
            }
            Bill latest = createBill(dueRent,leaseStart,person.getRoom(), balance,this.getSystemUser());

            GregorianCalendar calendar = new GregorianCalendar(TimeZone.getTimeZone(leaseStart.getZone()));
            ZonedDateTime currentTime = calendar.toZonedDateTime();
            ZonedDateTime tmpTimeStamp = leaseStart;
            //Do this to skip the first month because it has already been billded.
            tmpTimeStamp = tmpTimeStamp.withDayOfMonth(1).plus(Period.ofMonths(1));
            //Iterate through and bill all prior months. Case where tenant has lived in prior months without being charged
            while(tmpTimeStamp.isBefore(currentTime)){
                latest = createBill(person.getRoom().getRent(),tmpTimeStamp,person.getRoom(), latest.getBal().add(latest.getRoom().getRent()),
                        this.getSystemUser());
                tmpTimeStamp = tmpTimeStamp.plus(Period.ofMonths(1));
            }
            return person;
        }else{
            throw new IllegalStateException("Unknown instance type supplied: "+arg.getClass());
        }
    }
    private Bill createBill(BigDecimal dueRent, ZonedDateTime timeStamp, Room room, BigDecimal balance, Users user){
        Bill newBill = new Bill();
        newBill.setBal(balance);
        newBill.setAmt(dueRent);
        newBill.setPmtDtEpochMilli(timeStamp.toInstant().toEpochMilli());
        newBill.setTxnTmEpochMilli(Instant.now().toEpochMilli());
        newBill.setRoom(room);
        newBill.setType("Bill");
        newBill.setUser(user);
        setStatus(newBill);
        jpaApi.em().persist(newBill);
        return newBill;
    }
    private BigDecimal getProratedRent(BigDecimal monthlyRent, ZonedDateTime leaseStart) {
        int numDays = leaseStart.getMonth().maxLength();
        int dayOfMonth =  leaseStart.getDayOfMonth();
        //The -1 is to set the charging from the current day.
        int daysToCharge = numDays - (dayOfMonth - 1);
        return monthlyRent.divide(new BigDecimal(numDays), 6, RoundingMode.CEILING).multiply(new BigDecimal(daysToCharge));
    }

    public void monthlyBill(){
        String queryString = "SELECT * FROM ( SELECT b.*, rank() OVER(PARTITION BY room_id order by txnTmEpochMilli desc ) from bill b ) as sn where sn.rank = 1";

        Query query = jpaApi.em().createNativeQuery(queryString,Bill.class);
        Bill bill, newBill;
        for(Object obj: query.getResultList()){
            //room, Amount, balance, month, txnTmEpochMilli, type,
            bill = (Bill)obj; newBill = new Bill();
            if(bill.getRoom().getState() != null && bill.getRoom().getState().equalsIgnoreCase("occupied")){
                newBill.setRoom(bill.getRoom()); //set room
                newBill.setAmt(newBill.getRoom().getRent()); //set amount based on rent amount
                newBill.setBal(newBill.getAmt().add(bill.getBal())); // add amount to existing balance to get new balance from curr bill
                newBill.setTxnTmEpochMilli(Instant.now().toEpochMilli());
                newBill.setType("Bill");
                //newBill.setPaidBy(this.getSystemUser());
                setStatus(newBill);
                jpaApi.em().persist(newBill);
            }
        }

    }
    private void setStatus(Bill newBill){
        if(newBill.getBal().compareTo(new BigDecimal(0)) <= 0 ) {
            newBill.getRoom().setStatus("Good");
        }else{
            newBill.getRoom().setStatus("Lapse");
        }
    }
    private Users getSystemUser(){
        return (Users)jpaApi.em().createNamedQuery("select User by username").setParameter("username","Automated").getSingleResult();
    }
}
