package models.deleteMe;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.crypto.MacProvider;

import java.security.Key;

/**
 * Created by kip on 5/30/17.
 */
public class User3 {
    private final String password;
    private final String username;

    public User3(String username, String password) {
        this.password = password;
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }

    public static User3 create(String username, UserRepository repository) {
        return repository.find(username);
    }

    public boolean authenticate(String password) {
        return this.password.equals(password);
    }

    public static User3 create(String username) {
        return create(username, new UserRepository());
    }

    public static User3 create(String username, String password) {

        return create(username, new UserRepository());
    }
    public String getJWT(){

        Key key = MacProvider.generateKey();
        String compactJws = Jwts.builder().setSubject("Joe").signWith(SignatureAlgorithm.HS512, key).compact();
        //System.out.println("I am here Kip:"+compactJws);

        //System.out.println("Belongs to Joe: "+Jwts.parser().setSigningKey(key).parseClaimsJws(compactJws).getBody().getSubject().equals("Joes"));
        return compactJws;
    }
}