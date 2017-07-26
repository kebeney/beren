package models.persistence.person;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.persistence.Room;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/** This represents the data model for the tenant.
 * Created by kip on 6/3/17.
 */
//@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@Entity(name = "Tenant")
//@DiscriminatorValue("Tenant")
public class Tenant extends Person {

    @ManyToOne(targetEntity = Room.class, fetch = FetchType.LAZY)
    @JsonBackReference
    private Room room;

    private String leaseStart;
    private String leaseEnd;

    @Transient
    private Boolean prorate;

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public String getLeaseStart() {
        return leaseStart;
    }

    public void setLeaseStart(String leaseStart) {
        this.leaseStart = leaseStart;
    }

    public String getLeaseEnd() {
        return leaseEnd;
    }

    public void setLeaseEnd(String leaseEnd) {
        this.leaseEnd = leaseEnd;
    }

    public Boolean getProrate() {
        return prorate;
    }

    public void setProrate(Boolean prorate) {
        this.prorate = prorate;
    }
}
