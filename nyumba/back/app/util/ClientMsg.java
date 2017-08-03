package util;

/**This class is used to convey an message, error, and/or exception back to the client. Anytime this class is returned from anywhere,
 * all subsequent processing should be skipped and this message returned to the calling client.
 * Created by kip on 6/13/17.
 */
public class ClientMsg {
    private String msg;
    private Long id;
    private Object data;

    public ClientMsg(){}
    public ClientMsg(Long id,String msg){
        this.msg = msg; this.id = id;
    }
    public ClientMsg(String msg){
        this.msg = msg;
    }
    public ClientMsg(String msg, Object data){
        this.msg = msg; this.data = data;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
