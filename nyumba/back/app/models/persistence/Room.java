package models.persistence;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.persistence.person.Tenant;
import models.persistence.person.Users;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashSet;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

//@NamedQuery(query = "select r from Room r where r.building.id = :buildingId", name = "select rooms by buildingId")
@NamedQueries({
        @NamedQuery(query = "select r.bills from Room r where r.id = :parentId", name = "select Bill by parentId"),
        @NamedQuery(query = "select r.personList from Room r where r.id = :parentId", name = "select Person by parentId")
})
@Entity
@Table(uniqueConstraints=@UniqueConstraint(columnNames= {"name","building_id"}))
@Where(clause = "deleted = false or deleted = null")
public class Room {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
	private Long id;

    @ManyToOne(targetEntity = Building.class, fetch = FetchType.LAZY)
    @JsonBackReference
    private Building building;

    @OneToMany(targetEntity = Tenant.class, mappedBy = "room", fetch = FetchType.LAZY, cascade = {CascadeType.ALL}, orphanRemoval = true)
    @Column(nullable = true)
    private Set<Tenant> personList;

    @OneToMany(targetEntity = Bill.class,   mappedBy = "room", fetch = FetchType.LAZY, cascade = {CascadeType.ALL}, orphanRemoval = true)
    @Column(nullable = true)
    @JsonManagedReference
    @OrderBy("txnTmEpochMilli ASC")
    private SortedSet<Bill> bills;

    @ManyToMany(targetEntity = Users.class, fetch = FetchType.LAZY)
    @JsonBackReference
    private Set<Users> tenantsSelectedRoom;

    @Transient
    private Long parentId;

    @Column(name = "ord", columnDefinition = "integer default nextval('serial')")
    private BigInteger ord;

    private String name;
    private BigDecimal rent;
    @Column(columnDefinition = "varchar default 'New'")
    private String status;
    @Column(columnDefinition = "varchar default 'New'")
    private String state;
    @Column(columnDefinition = "boolean default false")
    private Boolean deleted = false;

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<Tenant> getPersonList() {
        return personList == null ? new HashSet<>(): personList ;
    }

    public void setPersonList(Set<Tenant> personList) {
        this.personList = personList;
    }

    public Building getBuilding() {
        return building;
    }

    public void setBuilding(Building building) {
        this.building = building;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public BigInteger getOrd() {
        return ord;
    }

    public void setOrd(BigInteger ord) {
        this.ord = ord;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getRent() {
        return rent;
    }

    public void setRent(BigDecimal rent) {
        this.rent = rent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public SortedSet<Bill> getBills() {
        if(bills == null){
            return new TreeSet<>();
        }
        return bills;
    }

    public void setBills(SortedSet<Bill> bills) {
        this.bills = bills;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public Set<Users> getTenantsSelectedRoom() {
        return tenantsSelectedRoom;
    }

    public void settenantsSelectedRoom(Set<Users> tenantSelectedRoom) {
        this.tenantsSelectedRoom = tenantSelectedRoom;
    }
    public void addTenantsSelectedRoom(Users user){
        if(this.tenantsSelectedRoom == null){
            this.tenantsSelectedRoom = new HashSet<>();
        }
        this.tenantsSelectedRoom.add(user);
    }
}
