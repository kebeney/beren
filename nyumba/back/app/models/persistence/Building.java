package models.persistence;

import com.fasterxml.jackson.annotation.*;
import models.persistence.person.Users;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/** This class represent a building/property. Note that the named quries used in the search function of ObjectRetrieve class are here as well.
 * Created by kip on 3/22/17.
 */
//@NamedQuery(query = "select b.rooms from Building b where b.id = :parentId order by ord desc ", name = "select Room by parentId")
@NamedQueries({
        //@NamedQuery(query = "select b from Building b where b.name like = :parentId order by ord", name = "search Building for match string"),
        @NamedQuery(query = "select b.rooms from Building b where b.id = :parentId order by ord", name = "select Room by parentId"),
        @NamedQuery( query = "select b from Building b where CONCAT_WS('|',b.name,b.street,b.city,b.county,b.country) like :searchString " , name = "search Building match anyColumn" )
})
//@JsonFilter("filterOutAllExceptBuilding")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Entity
public class Building {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;

    private String name;
    private String street;
    private String city;
    private String county;
    private String country;

    @Transient
    private Long parentId;

//    @Transient
//    @JsonIgnore
//    public static final String[] tenantFields =   {"id","name","street","city","county","country","selectedRooms","rooms"};
//
//    @Transient
//    @JsonIgnore
//    public static final String[] landLordFields = {"id","name","street","city","county","country","selectedRooms","rooms"};

    @OneToMany(targetEntity = Room.class, mappedBy = "building", fetch = FetchType.LAZY, cascade = {CascadeType.ALL},orphanRemoval = true)
    @Column(nullable = true)
    @JsonManagedReference
    @OrderBy("ord ASC")
    Set<Room> rooms;

    @ManyToMany(targetEntity = Room.class, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Room> selectedRooms;

    @JsonBackReference
    @ManyToMany(targetEntity = Users.class, mappedBy = "apts")
    Set<Users> users;

    @Override
    public boolean equals(Object other){
        return other instanceof Building && ((Building)other).id == this.id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCounty() {
        return county;
    }

    public void setCounty(String county) {
        this.county = county;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Set<Room> getRooms() {
        return rooms == null ? new HashSet<>(): rooms;
    }

    public void setRooms(Set<Room> rooms) {
        this.rooms = rooms;
    }
    public void addRoom(Room room){
        if(this.rooms == null){
            this.rooms = new HashSet<>();
        }
        this.rooms.add(room);
    }

    public Set<Users> getUsers() {
        return users == null ? new HashSet<>() : users;
    }

    public void setUsers(Set<Users> users) {
        this.users = users;
    }
    public void addUsers(Users user){
        if(this.users == null){
            this.users = new HashSet<>();
        }
        this.users.add(user);
    }
    public void removeUser(Users user){
        if(this.users != null){
            this.users.remove(user);
        }
    }

    public Set<Room> getSelectedRooms() {
        return selectedRooms;
    }

    public void setSelectedRooms(Set<Room> selectedRooms) {
        this.selectedRooms = selectedRooms;
    }
    public void addSelectedRoom(Room room){
        if(this.selectedRooms == null){
            this.selectedRooms = new HashSet<>();
        }
        this.selectedRooms.add(room);
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
