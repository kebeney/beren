package util;

/** This enum is mean't to uniquely identify all the types of values that will be kept in the Args map. The map is used to pass arguments around and to collect
 * responses to be sent to the client.
 * Created by kip on 6/13/17.
 */
public enum Args {
    //classType - is the model we are dealing with
    //Action identifies the block of code to be executed in the respective function in Types class
    //mappedObj - is the object that has been mapped from the request. It might be re-assigned as the execution proceeds and might eventually be returned.
    //data - used to identify the json data object that is a jsonArray supplied from client request
    //terminate is used to indicate that processing should end and result is returned to client.
    mappedObj,classType,data, action, userName, user, role,skipHeader, filterOutAllExceptFields, serializeAllExceptFields;
    public enum ACTIONS { EDIT, DELETE }

}
