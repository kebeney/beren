package util;


import com.mongodb.MongoClient;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.Morphia;
import play.Configuration;
import play.Logger;


import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * Created by kip on 5/27/17.
 */
@Singleton
public class MongoDS {
    private static final Logger.ALogger logger = Logger.of(MongoDS.class);
    private static Datastore datastore;
    private Configuration config;

    @Inject
    public MongoDS(Configuration configuration){
        this.config = configuration;
    }

    public Datastore get(){
        if(datastore == null){
            final Morphia morphia = new Morphia();
            morphia.mapPackage("models.mongo");
            MongoClient mongoClient = new MongoClient( config.getString("mongodb.host"), config.getInt("mongodb.port"));
            datastore = morphia.createDatastore(  mongoClient, config.getString("mongodb.database"));
        }
        return datastore;
    }
}
