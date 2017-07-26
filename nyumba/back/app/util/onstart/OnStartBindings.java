package util.onstart;

import com.google.inject.AbstractModule;
import play.libs.akka.AkkaGuiceSupport;
/**
 * Created by kip on 5/17/17.
 */
public class OnStartBindings extends AbstractModule implements AkkaGuiceSupport {
    @Override
    protected void configure() {
        //bindActor(RoomStatus.class, "update-db-actor");
        bind(SchedulerTask.class).asEagerSingleton();
        bind(InitializeDB.class).asEagerSingleton();
    }
}


