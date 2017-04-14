package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Room {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
	public Long id;

    public String num;
    public String name;
    public String rent;
    public String status;
    public String occupant;
}
