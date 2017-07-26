package models.deleteMe;

import org.mongodb.morphia.annotations.Entity;
import util.MongoDS;

import javax.inject.Inject;

/**
 * Created by kip on 5/27/17.
 */
@Entity(value = "users", noClassnameStored = true)
public class User2 {
    @Inject  MongoDS mongoDS;

    public String name = "Kebeney";
    public Integer age = 25 ;

    //public void save() {
    //    mongoDS.datastore().save(this);
   // }

//    public User2 query() {
//        return mongoDS.datastore()
//                .createQuery(User2.class)
//                .get();
//    }

}