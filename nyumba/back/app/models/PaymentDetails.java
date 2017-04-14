package models;

import javax.persistence.*;
import java.time.Instant;

/**
 * Created by kip on 3/26/17.
 */
@NamedQuery(query = "select d from PaymentDetails d where d.roomId = :roomId", name = "select room details by roomId")
@Entity
public class PaymentDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public Long Id;

    public Long roomId;
    public String roomName;
    public String roomNum;
    public String month;
    public String rent;
    public String amount;
    public String balance;
    public String totalPaid;
    public String paymentDate;
    public String receiptNumber;
}
