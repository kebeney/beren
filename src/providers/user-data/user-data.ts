import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {localStoredUser, Person} from "../../interfaces/constants";

/*
  Generated class for the UserDataProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class UserDataProvider {

  constructor(private storage: Storage){}

  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  public hasLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value:boolean) => {
      return value === null ? false : value;
    });
  };
  public syncLocal(p:Person|undefined): Promise<boolean>{
    if(p) return this.localLogin(p);
    else return this.localLogout();
  }
  public getUser(): Promise<Person>  {
    return this.storage.get(localStoredUser).then( (user: Person) => {
      return user
    });
  }

  //----------------Private helper methods-----------------------------------
  private localLogin(person: Person): Promise<any>{
    let loggedIn: Promise<boolean> = this.storage.set(this.HAS_LOGGED_IN,true);
    let saveUser: Promise<Person> = this.storage.set(localStoredUser,person);
    return Promise.all([loggedIn,saveUser]);
  }
  private localLogout(): Promise<any>{
    let logout: Promise<any> = this.storage.remove(this.HAS_LOGGED_IN);
    let removeUser: Promise<any> = this.storage.remove(localStoredUser);
    return Promise.all([logout,removeUser]);
  }

}
