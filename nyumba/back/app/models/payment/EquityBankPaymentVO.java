package models.payment;

import java.math.BigDecimal;

public class EquityBankPaymentVO {
    public EquityBankPaymentVO(String type, String mobileNumber, String auditNumber, BigDecimal amount, String description){
        this.customer = new Customer(mobileNumber);
        this.transaction = new Transaction(amount,type,auditNumber,description);
    }

    private Customer customer;
    private Transaction transaction;

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }
}

class Customer{
    private String mobileNumber;

    Customer(String mobileNumber){
        this.mobileNumber = mobileNumber;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}

class Transaction{
    Transaction(BigDecimal amount, String type,String auditNumber,String description){
        this.amount = amount; this.description = description; this.type = type; this.auditNumber = auditNumber;
    }
    private BigDecimal amount;
    private String description;
    private String type;
    private String auditNumber;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAuditNumber() {
        return auditNumber;
    }

    public void setAuditNumber(String auditNumber) {
        this.auditNumber = auditNumber;
    }
}