package util;


import business.logic.CommonLogic;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import models.persistence.Building;
import models.persistence.Room;
import models.persistence.person.Users;
import org.springframework.util.ReflectionUtils;
import play.Logger;
import util.Annotations.ErenMapField;

import javax.enterprise.inject.spi.Bean;
import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

/** This is a  helper class  to help map fields for a source object to a destination object. Only the declared methods
 * (meaning methods explicitly created in the class as opposed to inherited methods) that exist in both the source and destination objects
 * get mapped. Everything else gets ignored. Collection objects are also ignored as well even if declared.
 * Created by kip on 3/25/17.
 */
public class Mapper {
    private static final Logger.ALogger logger = Logger.of(Mapper.class);

    /**
     * This function will map fields from src to dst during edits. Null fields and non primitives are ignored.
     * @param src - is the source object of the fields to be mapped
     * @param dst - is the destination object where we are mapping the source fields to.
     */
    public Object mapFields(Object src,Object dst) {

        logger.debug("Mapping: "+src.getClass()+"  to "+dst.getClass());

        //Use the annotation based mapper to map the fields.
        if(src.getClass() != dst.getClass() ) {
            return this.mapUnrelatedObjects(src,dst);
        }

        Class tClass = dst.getClass();

        Method[] methods = ReflectionUtils.getAllDeclaredMethods(src.getClass());

        try{
            for(Method m: methods){

                //Use java.lang.Class to avoid mapping collections
                if(m.getName().startsWith("get") && !m.getReturnType().getName().equalsIgnoreCase("java.lang.Class")){
                    //Get value from src obj
                    Object val = m.invoke(src);
                    if(val != null  && !Collection.class.isAssignableFrom(m.getReturnType())){
                        //Get the target method
                        String setter = "set"+m.getName().substring(3);
                        Method dstMthd = tClass.getMethod(setter,m.getReturnType());
                        //Invoke target method with value
                        dstMthd.invoke(dst,val);
                    }
                }
            }
        }catch (InvocationTargetException | IllegalAccessException | NoSuchMethodException exe){
            exe.printStackTrace();
        }
        return dst;
    }

    /**
     * This function is used to map classes that are not instances of each other and potentially not of the same type but just have similarly named functions.
     * The correct ErenMapField annotation should be used for the
     * mapping to be successful.
     * @param src
     * @param dst
     * @return
     */
    private Object mapUnrelatedObjects(Object src, Object dst){

        Class srcClass = src.getClass();

        Method[] srcMethods = ReflectionUtils.getAllDeclaredMethods(src.getClass());
        Method[] dstMethods = ReflectionUtils.getAllDeclaredMethods(dst.getClass());

        try{
            for(Method m: dstMethods){

                //Use java.lang.Class to avoid mapping collections
                if(m.getName().startsWith("set") && m.isAnnotationPresent(ErenMapField.class)){

                    String getter = "get"+m.getName().substring(3);
                    Method srcMethod = getMethod(srcMethods,getter);

                    //Get value from src obj
                    Object val = null;
                    if( srcMethod != null) {
                        val = srcMethod.invoke(src);
                    }else{
                        throw new IllegalArgumentException("Tried to invoke: "+getter+" on "+srcClass+" but method was not found. ");
                    }
                    m.invoke(dst,val);
                }
            }
        }catch (InvocationTargetException | IllegalAccessException exe){
            exe.printStackTrace();
        }
        return dst;
    }
    private Method getMethod(Method[] methods, String name){
        for(Method m: methods){
            if(m.getName().equalsIgnoreCase(name)){
                return m;
            }
        }
        return null;
    }

    public String toJson(Object value, Map <Args,Object> args){
        ObjectMapper mapper = new ObjectMapper();
        SimpleFilterProvider filters = new SimpleFilterProvider();

        //setFilterFields(args,filters);

        mapper.setFilterProvider(filters);
        String json = "{}" ;
        try {
            json = mapper.writer(filters).writeValueAsString(value);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        logger.debug("Returning: "+json);
        return json;
    }

    private Map<Args,Object> setFilterFields(Map<Args,Object> args, SimpleFilterProvider filters){

        Users user = (Users)args.get(Args.user);
        String role = user.getRole();

        //        Object serializeExceptObj = args.get(Args.serializeAllExceptFields);
//        Object filterOutExceptObj = args.get(Args.filterOutAllExceptFields);

//        logger.debug("One is: "+serializeExceptObj);
//        logger.debug("Two is: "+filterOutExceptObj);

        Set<String> filterOutExceptBuilding = new HashSet<>();
        Set<String> filterOutExceptUser = new HashSet<>();

        logger.debug("SExcept:"+filterOutExceptBuilding.toString());
        logger.debug("FExcept:"+filterOutExceptUser.toString());

//        if(serializeExceptObj != null) {
//            logger.debug(""+serializeExceptObj.getClass());
//            //serializeExceptSet = (Set<String>)serializeExceptObj;
//        };
//        if(filterOutExceptObj != null) {
//            logger.debug(""+serializeExceptObj.getClass());
//            //filterOutExceptSet = (Set<String>)filterOutExceptObj;
//        };
        filters.addFilter("filterOutAllExceptBuilding",SimpleBeanPropertyFilter.serializeAllExcept(filterOutExceptBuilding));
        filters.addFilter("filterOutAllExceptUser",SimpleBeanPropertyFilter.serializeAllExcept(filterOutExceptUser));

       // Collections.addAll(filterOutExceptUser, Users.allowedFields);

        if(role.equalsIgnoreCase("landlord")){
           // Collections.addAll(filterOutExceptBuilding, Building.landLordFields);
        }else{
            //Collections.addAll(filterOutExceptBuilding, Building.tenantFields);
        }

        return args;
    }
}
