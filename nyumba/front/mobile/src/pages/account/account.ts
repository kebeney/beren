import { Component } from '@angular/core';

import {AlertController, Events, NavController} from 'ionic-angular';

import {QuestionView} from "../../components/question-view/question-view";
import {FunctionsProvider} from "../../providers/functions";
import {Person, State, usersPath} from "../../interfaces/consts";
import {Observable} from "rxjs/Observable";
import {Store} from "@ngrx/store";


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  state: Observable<State>;
  user: Observable<Person>;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController,public events: Events, public fns: FunctionsProvider,
              public store: Store<State>) {
    this.state = store.select("componentReducer");
    this.user  = this.fns.getUserObservable().map(u => u);
  }
  ionViewDidEnter() {
    this.user.take(1).subscribe(u => {
      if(!u){  this.fns.restoreUser(); }
    });
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }
  resetPwd(){

  }
  updatePersonalInfo(){
    let lUser = null;
    this.user.take(1).subscribe(s => { lUser = s; });

    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:'user',val:lUser,fill:true,role: this.fns.getRole()}), title: 'Edit Personal Info',
      model: 'User', target: 'user', parentId: null, jsonPath: this.fns.mapPathId(usersPath,lUser,null,null,), urlExt: '/edit'
    },this.fns.navOptionsForward);
  }

  support() {
    this.navCtrl.push('SupportPage');
  }
  ionViewWillEnter(){
    console.log('Entering AccountsPage..');
  }
  ionViewWillLeave(){
    console.log('Leaving AccountsPage..');
  }
}
