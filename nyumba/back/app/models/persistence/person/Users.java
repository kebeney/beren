package models.persistence.person;

import com.fasterxml.jackson.annotation.*;
import models.persistence.Bill;
import models.persistence.Building;
import play.data.validation.Constraints;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;


@NamedQueries({
        @NamedQuery(query = "select u from Users u where u.username = :username", name = "select User by username")
})
//@JsonFilter("filterOutAllExceptUser")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Entity(name = "Users")
public class Users extends Tenant {

//    @JsonIgnore
//    public static final String[] allowedFields = {"id","username","role","apts","claims","bills"} ;

    @Transient
    private Map<String,Object> claims;

    @Constraints.Required
    @Column(unique = true)
    private String username;

    @JsonIgnore
    private byte [] salt;
    @JsonIgnore
    private byte [] hash;

    //@NotEmpty
 //   @ElementCollection
 //   @OrderColumn
 //   private String[] roles;

    @Column
    private String role;

    @Column(nullable = true)
    @JsonManagedReference
    @ManyToMany(targetEntity = Building.class, fetch = FetchType.LAZY)
    private Set<Building> apts;

    @Transient
    @JsonIgnore
   // @Constraints.Required
    private char[] password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public char[] getPassword() {
        return password;
    }
    public void setPassword(char[] password) {
        this.password = password;
    }

    public byte[] getSalt() {
        return salt;
    }

    public void setSalt(byte[] salt) {
        this.salt = salt;
    }

    public byte[] getHash() {
        return hash;
    }

    public void setHash(byte[] hash) {
        this.hash = hash;
    }

    public Map<String, Object> getClaims() {
        return claims;
    }

    public void setClaims(Map<String, Object> claims) {
        this.claims = claims;
    }

    public Set<Building> getApts() {
        if(apts == null) return new HashSet<>();
        return apts;
    }
    public void addApt(Building apt){
        if(this.apts == null){
            this.apts = new HashSet<>();
        }
        this.apts.add(apt);
    }
    public void removeApt(Building apt){
        if(this.apts != null){
            this.apts.remove(apt);
        }
    }

    public void setApts(Set<Building> apts) {
        this.apts = apts;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    //This is only for reference purposes for framework's sake. We never actually pull this anywhere.
    @JsonBackReference
    @OneToMany(targetEntity = Bill.class, fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "user")
    private Set<Bill> bills;

    public Set<Bill> getBills() {
        return bills;
    }

    public void setBills(Set<Bill> bills) {
        this.bills = bills;
    }
    public void addBill(Bill bill){
        if(this.bills == null){
            this.bills = new HashSet<>();
        }
        this.bills.add(bill);
    }
}
