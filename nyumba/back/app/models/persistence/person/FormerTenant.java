package models.persistence.person;

import play.data.validation.Constraints;
import util.Annotations.ErenMapField;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.math.BigDecimal;

/** Entity used to keep former tenant info.
 * Created by kip on 6/20/17.
 */
@Entity
public class FormerTenant{

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;

    private String roomName;
    private String buildingName;
    private String leaseStart;
    private String leaseEnd;
    private BigDecimal bal;

    private String firstName;
    private String lastName;
    @Constraints.Email
    private String email;
    private String phoneNo;
    private String emcp;
    private String street;
    private String city;
    private String postcode;
    private String country;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getLeaseStart() {
        return leaseStart;
    }

    @ErenMapField
    public void setLeaseStart(String leaseStart) {
        this.leaseStart = leaseStart;
    }

    public String getLeaseEnd() {
        return leaseEnd;
    }

    @ErenMapField
    public void setLeaseEnd(String leaseEnd) {
        this.leaseEnd = leaseEnd;
    }

    public String getFirstName() {
        return firstName;
    }

    @ErenMapField
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    @ErenMapField
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }
    @ErenMapField
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNo() {
        return phoneNo;
    }
    @ErenMapField
    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getEmcp() {
        return emcp;
    }
    @ErenMapField
    public void setEmcp(String emcp) {
        this.emcp = emcp;
    }

    public String getStreet() {
        return street;
    }
    @ErenMapField
    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }
    @ErenMapField
    public void setCity(String city) {
        this.city = city;
    }

    public String getPostcode() {
        return postcode;
    }
    @ErenMapField
    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    public String getCountry() {
        return country;
    }
    @ErenMapField
    public void setCountry(String country) {
        this.country = country;
    }
    public String getRoomName() {
        return roomName;
    }
    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }
    public String getBuildingName() {
        return buildingName;
    }
    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public BigDecimal getBal() {
        return bal;
    }

    public void setBal(BigDecimal bal) {
        this.bal = bal;
    }
}
