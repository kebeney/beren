package controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.ReferenceType;
import models.PaymentDetails;
import models.Room;
import play.data.FormFactory;
import play.db.jpa.JPAApi;
import play.db.jpa.Transactional;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import scala.util.parsing.json.JSONArray;
import util.Transform;

import javax.inject.Inject;
import javax.persistence.Query;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static play.libs.Json.toJson;

public class RoomController extends Controller {

    private final FormFactory formFactory;
    private final JPAApi jpaApi;

    @Inject
    public RoomController(FormFactory formFactory, JPAApi jpaApi) {
        this.formFactory = formFactory;
        this.jpaApi = jpaApi;
    }

    @Transactional
    public Result addRoom() {
        response().setHeader("Access-Control-Allow-Origin", "*");
        Room person = formFactory.form(Room.class).bindFromRequest().get();
        jpaApi.em().persist(person);
        return ok("I am done");
    }
    @Transactional
    public Result updateRooms() throws Exception {
        Transform.fromJSON(request().body().asJson().toString(),new TypeReference<List<Room>>() {}).forEach(room -> { jpaApi.em().persist(room);});
        jpaApi.em().flush();
        return getRooms();
        //return ok("{\"data\": [{\"result\": \"success\"}]}").as("application/json");

    }

    @Transactional(readOnly = true)
    public Result getRooms() {
        return ok(toJson(jpaApi.em().createQuery("select p from Room p").getResultList()));
    }
    @Transactional(readOnly = true)
    public Result getRoomDetails(Long id) {
        return ok(toJson(jpaApi.em().createNamedQuery("select room details by roomId").setParameter("roomId",id).getResultList()));
    }
    @Transactional
    public Result updateRoomDetails() throws Exception{
        Long roomId;
        JsonNode reqJson = request().body().asJson();
        if(reqJson.isArray() && reqJson.size() > 0){ roomId = reqJson.get(0).get("roomId").asLong();  }
        else{ return ok(Json.newArray()); }
        Transform.fromJSON(reqJson.toString(), new TypeReference<List<PaymentDetails>>() {}).forEach(detail -> jpaApi.em().persist(detail));
        jpaApi.em().flush();
        return getRoomDetails(roomId);
    }

}
