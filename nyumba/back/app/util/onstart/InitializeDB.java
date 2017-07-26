package util.onstart;

import models.persistence.person.Users;
import play.Logger;
import play.db.jpa.JPAApi;
import security.Secured;

import javax.inject.Inject;
import javax.inject.Singleton;

/** Used to initialize the database.
 * Created by kip on 5/19/17.
 */
@Singleton
public class InitializeDB {
    private static final Logger.ALogger logger = Logger.of(InitializeDB.class);
    private final JPAApi jpaApi;
    private final Secured secured;
    @Inject
    public InitializeDB(JPAApi jpaApi, Secured secured){
        this.jpaApi = jpaApi; this.secured = secured;
        createOrderSeq();
    }
    private void createOrderSeq() {
        jpaApi.withTransaction(new Runnable(){
            public void run(){
                if(jpaApi.em().createNativeQuery("SELECT 0 FROM pg_class where relname = 'ord_seq'").getResultList().size() <= 0){
                    //Create the sequence. It does not exist yet.
                    jpaApi.em().createNativeQuery("CREATE SEQUENCE ord_seq START 1").executeUpdate();
                }

                if(jpaApi.em().createNamedQuery("select User by username").setParameter("username","Automated").getResultList().size() <= 0){
                    Users newUser = new Users();
                    newUser.setUsername("Automated");
                    newUser.setPassword("systemPassword".toCharArray());
                    jpaApi.em().persist(newUser);
                    //TODO: Remember to create the user password for the automated user at this point.
                };
            }
        });
    }
}
