package models.persistence;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.persistence.person.Users;

import javax.persistence.*;
import java.math.BigDecimal;

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

 //   @Column(nullable = true)
 //   @JsonManagedReference
 //   @ManyToOne(targetEntity = Users.class,fetch = FetchType.LAZY)
    @JsonManagedReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "users_id", nullable = false, updatable = false)
    private Users user;  //TODO: This is supposed to be used to keep track of the user who paid the bill.

    public int compareTo(Bill bill){
        return this.txnTmEpochMilli.compareTo(bill.txnTmEpochMilli);
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
}
