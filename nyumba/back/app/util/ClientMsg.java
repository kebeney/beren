package util;

/**This class is used to convey an message, error, and/or exception back to the client. Anytime this class is returned from anywhere,
 * all subsequent processing should be skipped and this message returned to the calling client.
 * Created by kip on 6/13/17.
 */
public class ClientMsg {

    private String msg;
//    private Long id;
    private Object obj;

    public ClientMsg(){}

    public ClientMsg(String msg){
        this.msg = msg;
    }

    public ClientMsg(String msg, Object obj){
        this.msg = msg; this.obj = obj;
    }
    public ClientMsg(Object obj){
        this.obj = obj;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getObj() {
        return obj;
    }

    public void setObj(Object obj) {
        this.obj = obj;
    }
}
