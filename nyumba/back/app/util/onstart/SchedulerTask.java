package util.onstart;

import akka.actor.ActorSystem;
import akka.actor.Cancellable;
import business.logic.PaymentApi;
import com.google.inject.Inject;
import scala.concurrent.duration.Duration;

import java.util.concurrent.TimeUnit;

/**
 * Created by kip on 5/16/17.
 */
public class SchedulerTask {
    @Inject
    public SchedulerTask(final ActorSystem system /*, @Named("update-db-actor")ActorRef updateDbActor  , RoomStatus monthlyBill, */, PaymentApi paymentApi){
        /*
        system.scheduler().schedule(
                Duration.create(0, TimeUnit.MILLISECONDS),
                Duration.create(1,TimeUnit.SECONDS),
                updateDbActor,
                "update",
                system.dispatcher(),
                null
        ); */
       /* Cancellable updateDBJOb = system.scheduler().schedule(
                Duration.create(0, TimeUnit.MILLISECONDS),
                Duration.create(5,TimeUnit.MINUTES),
                monthlyBill,
                system.dispatcher()
        ); */
        Cancellable invokeEquity = system.scheduler().schedule(
                Duration.create(0, TimeUnit.MILLISECONDS),
                Duration.create(10,TimeUnit.MINUTES),
                paymentApi,
                system.dispatcher()
        );
    }
}
