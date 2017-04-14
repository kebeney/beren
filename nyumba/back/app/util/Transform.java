package util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
/**
 * Created by kip on 3/25/17.
 */
public class Transform {
    public static <T> T fromJSON(final String jsonPacket,final TypeReference<T> type) throws Exception {
        return  new ObjectMapper().readValue(jsonPacket, type);
    }
}
