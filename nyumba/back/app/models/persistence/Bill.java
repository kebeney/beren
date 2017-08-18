package models.persistence;

import com.fasterxml.jackson.annotation.*;
import models.persistence.person.Users;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

/**This class is used to represent a bill or a payment from a client. The last entry in sorted order by txtTmEpochMilli will be the balance
 * that the client owes.
 * Created by kip on 5/10/17.
 */

//@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
//@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Bill implements Comparable<Bill> {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    public Long id;

    @ManyToOne( targetEntity = Room.class, fetch = FetchType.LAZY)
    @JsonBackReference
    private Room room;

    @Transient
    private Long parentId;

    private BigDecimal bal;
    private BigDecimal amt;
    private String type;
    private String rcpt;
    private Long pmtDtEpochMilli;
    private Long txnTmEpochMilli;
    private String description;
    private String status;
    private UUID auditNumber;

 //   @Column(nullable = true)
 //   @JsonManagedReference
 //   @ManyToOne(targetEntity = Users.class,fetch = FetchType.LAZY)
    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "users_id", nullable = false, updatable = false)
    private Users user;  //TODO: This is supposed to be used to keep track of the user who paid the bill.

    @Override
    public int compareTo(Bill bill){
        if(this.txnTmEpochMilli == null){
            return 1;
        }else if(bill.txnTmEpochMilli == null){
            return -1;
        }
        else if(this.txnTmEpochMilli == bill.txnTmEpochMilli){
            return 0;
        }else{
            return this.txnTmEpochMilli > bill.txnTmEpochMilli ? 1: -1 ;
        }
    }
    @Override
    public boolean equals(Object other){
        return other instanceof Bill && ((((Bill) other).txnTmEpochMilli.equals(this.txnTmEpochMilli)));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public BigDecimal getBal() {
        return bal;
    }

    public void setBal(BigDecimal bal) {
        this.bal = bal;
    }

    public BigDecimal getAmt() {
        return amt;
    }

    public void setAmt(BigDecimal amt) {
        this.amt = amt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRcpt() {
        return rcpt;
    }

    public void setRcpt(String rcpt) {
        this.rcpt = rcpt;
    }

    public Long getPmtDtEpochMilli() {
        return pmtDtEpochMilli;
    }

    public void setPmtDtEpochMilli(Long pmtDtEpochMilli) {
        this.pmtDtEpochMilli = pmtDtEpochMilli;
    }

    public Long getTxnTmEpochMilli() {
        return txnTmEpochMilli;
    }

    public void setTxnTmEpochMilli(Long txnTmEpochMilli) {
        this.txnTmEpochMilli = txnTmEpochMilli;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getAuditNumber() {
        return auditNumber;
    }

    public void setAuditNumber(UUID auditNumber) {
        this.auditNumber = auditNumber;
    }
}
