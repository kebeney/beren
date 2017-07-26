//package security;
//
//import models.persistence.Building;
//import models.persistence.person.Users;
//
//import java.util.Map;
//import java.util.Set;
//
///**
// * Created by kip on 7/16/17.
// */
//public class UserWrap extends Users {
//    public UserWrap(Users user, Map claims){
//        this.claims = claims;
//        mapUser(user);
//    }
//    public Set<Building> apts;
//    public Map claims;
//    private void mapUser(Users user){
//        this.setId(user.getId());
//        this.setRole(user.getRole());
//        this.setParentId(user.getParentId());
//        this.setFirstName(user.getFirstName());
//        this.setLastName(user.getLastName());
//        this.setEmail(user.getEmail());
//        this.setPhoneNo(user.getPhoneNo());
//        this.setEmcp(user.getEmcp());
//        this.setStreet(user.getStreet());
//        this.setCity(user.getCity());
//        this.setPostcode(user.getPostcode());
//        this.setCountry(user.getCountry());
//        this.apts = user.getApts();
//    }
//}
