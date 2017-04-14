package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * Created by kip on 3/22/17.
 */
@Entity
public class Building {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    public Long id;

    public String name;
}
