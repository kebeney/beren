package security;

import javax.crypto.KeyGenerator;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Created by kip on 6/4/17.
 */

public class KeyPairReadWrite {

    public static PrivateKey getPrivateKey(String filename)
            throws Exception {

        byte[] keyBytes = Files.readAllBytes(new File(filename+".pri").toPath());

        PKCS8EncodedKeySpec spec =
                new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }
    public static PublicKey getPublicKey(String filename) throws Exception {

        byte[] keyBytes = Files.readAllBytes(new File(filename+".pub").toPath());

        X509EncodedKeySpec spec =
                new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }
    public Long getIdKey(String fileName) throws IOException {
        byte[] keyBytes = Files.readAllBytes(new File(fileName+".idKey").toPath());
        return Long.parseLong(keyBytes.toString());
    }

    public void write(PublicKey publicKey, PrivateKey privateKey, String filename) throws FileNotFoundException, IOException {

        if(publicKey != null) writeBytes(publicKey.getEncoded(),filename+".pub");
        if(privateKey != null) writeBytes(privateKey.getEncoded(),filename+".pri");
        writeBytes("1".getBytes(),filename+".idKey");
    }
    private static void writeBytes(byte [] bytes, String fileName) throws IOException {
        FileOutputStream sigfos = new FileOutputStream(fileName);
        sigfos.write(bytes);
        sigfos.flush();
        sigfos.close();
    }
    public static Key getSingleKey(String fileName) {
        try {
            fileName = fileName + ".special.single.key";
            Path path = Paths.get(fileName);
            if (!Files.exists(path)) {
                Files.createFile(path);//.createDirectories(path);
                Key key = KeyGenerator.getInstance("AES").generateKey();
                Files.write(path, Base64.getEncoder().encodeToString(key.getEncoded()).getBytes());
                return key;
            }
            byte[] orig = Base64.getDecoder().decode(Files.readAllBytes(Paths.get(fileName)));
            return new SecretKeySpec(orig, 0, orig.length, "AES");
        }catch (IOException | NoSuchAlgorithmException  e){
            e.printStackTrace();
        }
        return null;
    }
}
