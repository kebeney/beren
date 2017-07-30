import { Component } from '@angular/core';
//import { NgForm } from '@angular/forms';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {Store} from "@ngrx/store";
import { NavController } from 'ionic-angular';

import { UserData } from '../../providers/user-data';
import { TabsPage } from '../tabs/tabs';
import {QuestionView} from "../../components/question-view/question-view";
import {AuthProvider} from "../../providers/auth";
import {FunctionsProvider} from "../../providers/functions";
import { Person, RESTORE_USER, State, usersPath} from "../../interfaces/consts";
import {Subscription} from "rxjs/Subscription";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  state: Observable<State>;
  private usrLgn: Subject<void> = new Subject<void>();
  private usrLgnSubs: Subscription
  credentials: {username: string, password?: string} = {username: 'bkebeney', password: 'kimbo456'};
  private submitted = false;

  constructor(public navCtrl: NavController, public userData: UserData, public auth: AuthProvider,
              private store: Store<State>, public fns: FunctionsProvider) {
    this.state = store.select('componentReducer');

  }

  ionViewDidLoad() {
    console.log('Login page did load...')
    //Check if already authenticated
    this.userData.hasLoggedIn().then((loggedIn: boolean) => {

      if(loggedIn){
        this.userData.getUser().then(user => {
          if(!this.tokenExp(user)){
            this.store.dispatch({type: RESTORE_USER, payload: {user: [user]}});
            this.navCtrl.setRoot(TabsPage,{user: user},this.fns.navOptionsForward);
            console.log('Already Authorized');
          }else{
            console.log('Session expired. Login again');
          }
        });
      }else{
        console.log('Not already authorized');
        //this.store.dispatch({type: LOGOUT})
      }

    });
  }

//   onLogin(form: NgForm) {
//  //   this.submitted = true;
//
//     if (form.valid) {
// //      this.userData.login(this.credentials.username);
// //      this.navCtrl.push(TabsPage);
//     }
//   }

  login(provider: string){

    switch (provider){
      case 'custom': {
        this.state.take(1).subscribe(s => {
          console.log('User before login request: '+JSON.stringify(s.users));
        });
        this.fns.formOutput('/api/auth/login','',this.credentials,'User',usersPath, {tgt: 'login'});
        this.submitted = true;
        // this.cancelSubs();
        // this.usrLgnSubs = this.state.takeUntil(this.usrLgn).subscribe(d => {
        //  // console.log('login: Users is: '+JSON.stringify(d.users));
        //   if(d.users instanceof Array && d.users.length == 1 && this.submitted){
        //     this.submitted = false;
        //     //console.log('login: sucess..User is: '+JSON.stringify(d.users));
        //     this.usrLgn.complete();
        //     //this.fns.user = d.users[0] ;
        //     //if(this.usrLgnSubs != undefined) this.usrLgnSubs.unsubscribe();
        //     this.userData.login(d.users[0]).then(() => {
        //       this.navCtrl.setRoot(TabsPage,{user: d.users[0]},this.fns.navOptionsForward);
        //     });
        //   }
        // });
        break;
      }case 'google': {
        this.auth.googleLogin();
        break;
      }case 'facebook': {
        this.auth.facebookLogin();
        break;
      }
    }
    //this.showLoader();
  }
  signUp(){
    this.navCtrl.push(QuestionView,{title: 'New User', model: 'User',questions: this.fns.getQuiz({tgt:'user',val:'',fill:false}), target: 'user', jsonPath: usersPath, urlExt: '/signup'});
//    this.cancelSubs();
//    console.log('in Signup');
//    this.usrLgnSubs = this.state.takeUntil(this.usrLgn).subscribe(d => {
//      if(typeof d.users[0] != 'undefined'){
//        let serverMillis = d.users[0].claims.exp;
//        let now = new Date();
//        let serverDate = new Date(serverMillis);
//        //Not expired yet. Just make the call.
//        if(serverDate > now){
//          this.usrLgnSubs.unsubscribe();
          //this.fns.user = d.users[0];
//          this.navCtrl.pop(this.fns.navOptionsBack);
//          this.store.dispatch({type: SHOW_MESSAGE, payload: {message: 'Account Created. Please login!'}})
          //this.navCtrl.setRoot(TabsPage,{user: d.users[0]},this.fns.navOptionsForward);
//        }else{
          //Time expired. Navigate back.
          //this.navCtrl.pop(this.fns.navOptionsBack);
//        }
//      }
//    })
  }
  tokenExp(user: Person): boolean{
    if(typeof user != 'undefined' && typeof user.claims !== 'undefined'){
      let serverMillis = user.claims.exp;
      let now = new Date();
      let serverDate = new Date(serverMillis);
      //Not expired yet. Just make the call.
      if(serverDate > now){
        return false;
      }else{
        //Time expired.
        return true;
      }
    }
    return true;
  }
  cancelSubs(){
    if(this.usrLgnSubs != null && this.usrLgnSubs != undefined){
      this.usrLgnSubs.unsubscribe();
    }
  }
  ngOnDestroy(){
    this.usrLgn.next();
    this.usrLgn.complete();
  }
  // onSignup() {
  //   this.navCtrl.push(SignupPage);
  // }
}



