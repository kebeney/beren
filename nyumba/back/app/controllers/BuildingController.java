package controllers;

import models.Building;
import models.Person;
import play.data.FormFactory;
import play.db.jpa.JPAApi;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;

import javax.inject.Inject;
import java.util.List;

import static play.libs.Json.toJson;

public class BuildingController extends Controller {

    private final FormFactory formFactory;
    private final JPAApi jpaApi;

    @Inject
    public BuildingController(FormFactory formFactory, JPAApi jpaApi) {
        this.formFactory = formFactory;
        this.jpaApi = jpaApi;
    }

    public Result index() {

        response().setHeader("Access-Control-Allow-Origin", "*");
        return ok("{\"data\": [{\"id\": \"1\" , \"name\" : \"Kip\" }]}").as("application/json");
    }


    @Transactional
    public Result addBuilding() {
        Building building = formFactory.form(Building.class).bindFromRequest().get();
        jpaApi.em().persist(building);
        return redirect(routes.BuildingController.getBuildings());
    }

    @Transactional(readOnly = true)
    public Result getBuildings() {
        List<Building> buildings = (List<Building>) jpaApi.em().createQuery("select b from Building b").getResultList();
        return ok(toJson(buildings));
    }

}
