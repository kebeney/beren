import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { UserData } from '../../providers/user-data';

import {FunctionsProvider} from "../../providers/functions/functions";
import {usersPath} from "../../interfaces/constants";
import {QuestionViewPage} from "../question-view/question-view";


@Component({
  selector: 'page-user',
  templateUrl: 'login.html'
})
export class LoginPage {

  credentials: {username: string, password?: string} = {username: 'bkebeney', password: 'kimbo456'};

  constructor(public navCtrl: NavController, public userData: UserData, public fns: FunctionsProvider) { }



  login(provider: string){

    switch (provider){
      case 'custom': {
        this.fns.formOutput({ext:'/api/auth/login',parentId:undefined,obj:this.credentials,model:'User',jsonPath:usersPath, tgt:'login'});
        break;
      }case 'google': {
      //this.auth.googleLogin();
      break;
    }case 'facebook': {
      //this.auth.facebookLogin();
      break;
    }
    }
  }
  signup(){
    this.navCtrl.push(QuestionViewPage,{title: 'New User', model: 'User',questions: this.fns.getQuiz({tgt:'user',val:undefined,fill:false}), target: 'user', jsonPath: usersPath, urlExt: '/signup'});
  }
}
