import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {localStoredUser, Person, State} from "../interfaces/consts";
import {Store} from "@ngrx/store";


@Injectable()
export class UserData {
  _favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  constructor(
    public events: Events,
    public storage: Storage,
    public store: Store<State>
  ) {}

  //--------------------------------------------------------New Functions --------------------------------------------------------------

  localLogin(person: Person): Promise<any>{
    let loggedIn: Promise<boolean> = this.storage.set(this.HAS_LOGGED_IN,true);
    let saveUser: Promise<Person> = this.storage.set(localStoredUser,person);
    return Promise.all([loggedIn,saveUser]);
  }
  localLogout(): Promise<any>{
    let logout: Promise<any> = this.storage.remove(this.HAS_LOGGED_IN);
    let removeUser: Promise<any> = this.storage.remove(localStoredUser);
    return Promise.all([logout,removeUser]);
  }
  hasLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === null ? false : value;
    });
  };

  //--------------------------------------------------------New Functions --------------------------------------------------------------

  hasFavorite(sessionName: string): boolean {
    return (this._favorites.indexOf(sessionName) > -1);
  };

  addFavorite(sessionName: string): void {
    this._favorites.push(sessionName);
  };

  removeFavorite(sessionName: string): void {
    let index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
    }
  };

  login(person: Person): Promise<any> {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.events.publish('user:login');
    return this.storage.set(localStoredUser,person)
//    return this.setUser(person);
  };
  // signup(username: string): void {
  //   this.storage.set(this.HAS_LOGGED_IN, true);
  //   this.setUser({username: username, claims: ''});
  //   //Signup event will just enable the right menu to show up.
  //   //this.events.publish('user:signup');
  // };

  // logout() {
  //   this.storage.remove(localStoredUser).then(() => {
  //     this.storage.remove(this.HAS_LOGGED_IN).then(()=>{
  //      // this.storage.remove('username');
  //       this.store.dispatch({type: LOGOUT, payload: {}});
  //       this.events.publish('user:logout');
  //     });
  //   });
  // };

  getUsername(): Promise<string> {
    return this.storage.get(localStoredUser).then((p: Person) => {
      return p.username;
    });
  };

  // setUser(person: Person): Promise<any>{
  //   return ;
  // }
  getUser(): Promise<Person>  {
    return this.storage.get(localStoredUser).then( (user: Person) => {
      return user
    });
  }
  getUserSync(): any {

  }

  checkHasSeenTutorial(): Promise<string> {
    return this.storage.get(this.HAS_SEEN_TUTORIAL).then((value) => {
      return value;
    });
  };
  getFromLocal(key: string): Promise<any>{
    return this.storage.get(key).then(val => val);
  }
}
