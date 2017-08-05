import {Component, OnInit} from '@angular/core';
import {AlertController, Events, IonicPage, NavController} from 'ionic-angular';
import {LOGOUT, SEND_MESSAGE, State, Person, RESTORE_USER, RESET_MESSAGE} from "../../interfaces/consts";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {FunctionsProvider} from "../../providers/functions";
import {UserData} from "../../providers/user-data";

/**
 *Home page that will route to the right page based on the role of the logged in user.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit{
  loggedIn: boolean = false;
  //role: string = '';
  state: Observable<State>;
  msgIgnore: Array<any> = ['loginSuccess','loginComplete','logout','logoutComplete'];

  constructor(public events: Events, public store: Store<State>, public fns: FunctionsProvider, public userData: UserData, public navCtrl: NavController, private altCtrl: AlertController) {
    //console.log('Constructor starting...');
    this.state = store.select('componentReducer');

    //---------------Subscribe to state to listen to login events---------------------------
    this.state.subscribe((s:State) => {

      let user = s['users'][0];
      let msg = s['msg'];
      //console.log('msg is:', msg);

      if(msg === 'loginSuccess' && (typeof user !== 'undefined')){
        this.userData.localLogin(user).then(() => {
          this.loggedIn = true;
          this.store.dispatch({type: SEND_MESSAGE, payload: {msg: 'loginComplete'}});
          this.events.publish('menu:login');
        });
      }else if((msg == 'logout' || msg == 'tokenExp') && this.loggedIn){
        console.log('msg is:',msg);
        this.loggedIn = false;
        console.log('Dispatching logout...');
        this.store.dispatch({type: LOGOUT});
        this.userData.localLogout().then(() => {
          if( this.navCtrl !== null){
            //this.navCtrl.popToRoot().then(() => {
              console.log('Setting root');
              this.navCtrl.setRoot(HomePage);
           // });
          }
          //TODO: start from here. Figure out how to show the user a message saying token has expired.
          //Invoke only the logout action here. Other actions my trigger a loop.
        });
      }
    });
    //console.log('Constructor end...');
    //---------------------------------------End of constructor-----------------------------
  }
  ngOnInit(){
    let showing: boolean = false;
    this.state.subscribe( (s: State): void => {
      let ignore = this.msgIgnore.find(msg => msg === s.msg);
      let msg: any = s.msg ;
      if(msg === 'tokenExp'){ msg = 'Session Expired!'}
      //console.log('showing: ',this.showing);
      if( !ignore && ( typeof msg === 'string') && (msg.trim() !== '') && !showing){
        showing = true;
        //Present message and wait for user to click ok.
        this.altCtrl.create({title: '', message: msg, buttons: [{text: 'Dismiss',handler: () => {
        }}]}).present().then(() => {
          showing = false;
          console.log('Show is:',showing);
          this.store.dispatch({type: RESET_MESSAGE});
        });
      }
    });
    // this.editMode = new Observable(observer => {
    //   this.state.subscribe(s => {
    //     observer.next(s.editMode);
    //   });
    // });
  }
  ionViewDidLoad(){
    //This helps when user logs out and logs back in immediately. The message will still be what it was before logout so if it was tokenExp,
    //it will be displayed a second time. Which should not be the case.
    console.log('Dispatching: RESET_MESSAGE');
    this.store.dispatch({type: RESET_MESSAGE});
    //console.log('Executing did load...');
    this.userData.getUser().then((user:Person) => {
      //console.log('user is: ',user);
      if(this.userData.hasLoggedIn() && typeof user !== 'undefined' && user !== null){
        this.store.dispatch({type: RESTORE_USER, payload: {user: user}});
        this.store.dispatch({type: SEND_MESSAGE, payload: {msg: 'loginSuccess'}});
      }
    });
  }
}
