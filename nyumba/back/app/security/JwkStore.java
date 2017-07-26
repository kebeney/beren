package security;

import play.Logger;

import java.io.IOException;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

/**
 * Created by kip on 6/4/17.
 */
public class JwkStore {
    private Logger.ALogger logger = Logger.of(JwkStore.class);
    PrivateKey privateKey ;
    PublicKey publicKey ;
    public JwkStore(String filePath){
        getKeyPair(filePath);
    }

    public RSAPrivateKey getPrivateKey() {
        return null;
    }

    public String getPrivateKeyId() {
        return null;
    }

    public RSAPublicKey get(String kid) {
        return null;
    }
    public void getKeyPair(String filePath){
        KeyPairGenerator keyPairGenerator = null;
        try {
            keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            KeyPair keyPair = keyPairGenerator.genKeyPair();
            privateKey = keyPair.getPrivate();
            publicKey = keyPair.getPublic();
            KeyPairReadWrite kprw = new KeyPairReadWrite();
            kprw.write(publicKey,privateKey,"keyPair");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (IOException ioe){
            ioe.printStackTrace();
        }
    }
}
