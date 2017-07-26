package models.deleteMe;

/**
 * Created by kip on 5/30/17.
 */
import com.mongodb.*;
import models.deleteMe.NotExistingUser;
import models.deleteMe.User3;

public class UserRepository {
    public User3 find(String username) {
        DBObject user = getUsers().findOne(new BasicDBObject("username", username));

        if (user == null)
            return new NotExistingUser();

        return new User3(username, (String) user.get("password"));
    }

    private DBCollection getUsers() {
        MongoClient client = new MongoClient(System.getProperty("mongo.host"));
        return client.getDB(System.getProperty("mongo.dbname")).getCollection("Users");
    }
}