package mail;

import play.Configuration;
import play.Logger;
import play.mvc.Result;

import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import javax.inject.Inject;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import static play.mvc.Results.ok;

/**
 * @author Crunchify.com
 *
 */

public class SendMail {

    private static final Logger.ALogger logger = Logger.of(SendMail.class);
    @Inject
    private Configuration configuration;
    private Properties mailServerProps = null;

    static Properties mailServerProperties;
    static Session getMailSession;
    static MimeMessage generateMailMessage;

    public CompletionStage<Result> apply(){
        if(mailServerProps == null){
            mailServerProps = new Properties();
            Map<String,Object> configs = configuration.asMap();
            configs.entrySet().forEach(e -> {
                if(e.getKey().equalsIgnoreCase("google")){
                    logger.debug(e.getKey()+":"+e.getValue());
                    Map propsMap = (Map)e.getValue();
                    propsMap.forEach((k,v) -> {
                        mailServerProps.put(k,v);
                    });
                }
            });
            logger.debug("Done setting mail connection properties...");
        }

        Session session = Session.getDefaultInstance(mailServerProps);
        MimeMessage message = new MimeMessage(session);
        try{
            message.addRecipients(Message.RecipientType.TO,"");
        }catch (Exception ex){

        }


        return CompletableFuture.completedFuture(ok());
    }

    public static void generateAndSendEmail()  {

        try{

            // Step1
            System.out.println("\n 1st ===> setup Mail Server Properties..");
            mailServerProperties = System.getProperties();
            mailServerProperties.put("mail.smtp.port", "587");
            mailServerProperties.put("mail.smtp.auth", "true");
            mailServerProperties.put("mail.smtp.starttls.enable", "true");
            System.out.println("Mail Server Properties have been setup successfully..");

            // Step2
            System.out.println("\n\n 2nd ===> get Mail Session..");
            getMailSession = Session.getDefaultInstance(mailServerProperties, null);
            generateMailMessage = new MimeMessage(getMailSession);
            generateMailMessage.addRecipient(Message.RecipientType.TO, new InternetAddress("2026442509@tmomail.net"));
            generateMailMessage.addRecipient(Message.RecipientType.CC, new InternetAddress("2026442526@tmomail.net"));
            generateMailMessage.setSubject("Verification code");
            String emailBody = "2863";
            generateMailMessage.setContent(emailBody, "text/plain");
            System.out.println("Mail Session has been created successfully..");

            // Step3
            System.out.println("\n\n 3rd ===> Get Session and Send mail");
            //Transport transport = getMailSession.getTransport("smtp");

            // Enter your correct gmail UserID and Password
            // if you have 2FA enabled then provide App Specific Password
            //transport.connect("smtp.gmail.com", "berencomplex@gmail.com", "A0aKC024");
            //transport.sendMessage(generateMailMessage, generateMailMessage.getAllRecipients());
            //transport.close();

        }catch(MessagingException ex){
            //System.out.println(ex);
            ex.printStackTrace();

        }
    }
}
