
'use strict';

import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, Events, IonicPage, NavController} from 'ionic-angular';
import {LOGOUT, SEND_MESSAGE, State, Person, RESTORE_USER, RESET_MESSAGE} from "../../interfaces/consts";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {FunctionsProvider} from "../../providers/functions";
import {UserData} from "../../providers/user-data";
import {Subscription} from "rxjs/Subscription";

/**
 *Home page that will route to the right page based on the role of the logged in user.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit, OnDestroy{
  loggedIn: boolean = false;
  showing: boolean = false;
  //role: string = '';
  state: Observable<State>;
  msgIgnore: Array<any> = ['loginSuccess','loginComplete','logout','logoutComplete'];
  eventsListener: Subscription

  constructor(public events: Events, public store: Store<State>, public fns: FunctionsProvider, public userData: UserData, public navCtrl: NavController, private altCtrl: AlertController) {
    this.state = store.select('componentReducer');
  }
  ngOnInit(){
    //---------------Subscribe to state to listen to login events and other messages---------------------------
    this.eventsListener = this.state.subscribe((s:State) => {

      let ignore = this.msgIgnore.find(msg => msg === s.msg);
      let msg: string = s.msg ;
      let showMsg: string = '';
      let user = s['users'][0];

      if(msg === 'tokenExp'){
        showMsg = 'Session Expired!'; msg = 'logout'
      }

      if(msg === 'loginSuccess' && (typeof user !== 'undefined')){
        this.userData.localLogin(user).then(() => {
          this.loggedIn = true;
          this.store.dispatch({type: SEND_MESSAGE, payload: {msg: 'loginComplete'}});
          this.events.publish('menu:login');
        });
      }else if((msg === 'logout') && this.loggedIn){
        console.log('msg is:',msg);
        this.loggedIn = false;
        console.log('Dispatching logout...');
        this.store.dispatch({type: LOGOUT});
        this.userData.localLogout().then(() => {
          if( this.navCtrl !== null){
            console.log('Setting root');
            this.navCtrl.setRoot(HomePage);
          }
          //Invoke only the logout action here. Other actions my trigger a loop.
        });
      }else {
        showMsg = msg;
        console.log('msg is:'+showMsg);
      }
      if( !(this.showing) && !ignore && showMsg && (showMsg.trim() !== '')){
        this.store.dispatch({type: RESET_MESSAGE});
        this.showing = true;
        //Present message and wait for user to click ok.
        this.altCtrl.create({title: '', message: showMsg, buttons: [{text: 'Dismiss',handler: () => {
          this.showing = false;
        }}]}).present().then(() => {
        });
      }
    });
  }
  ionViewDidLoad(){
    //This helps when user logs out and logs back in immediately. The message will still be what it was before logout so if it was tokenExp,
    //it will be displayed a second time. Which should not be the case.
    console.log('Dispatching: RESET_MESSAGE');
    this.store.dispatch({type: RESET_MESSAGE});
    this.userData.getUser().then((user:Person) => {
      if(this.userData.hasLoggedIn() && typeof user !== 'undefined' && user !== null){
        this.store.dispatch({type: RESTORE_USER, payload: {user: user}});
        this.store.dispatch({type: SEND_MESSAGE, payload: {msg: 'loginSuccess'}});
      }
    });
  }
  ngOnDestroy(){
    this.eventsListener.unsubscribe();
  }
}
