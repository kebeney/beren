import {Component, ViewChild} from '@angular/core';
import {IonicPage, Navbar, NavController, NavParams} from 'ionic-angular';
import {FunctionsProvider} from "../../providers/functions/functions";
import {navOptionsBack} from "../../interfaces/constants";
import {QuestionBase} from "../../providers/questions/question-base";

/**
 * Generated class for the QuestionViewPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-question-view',
  templateUrl: 'question-view.html',
})
export class QuestionViewPage {

  @ViewChild(Navbar) navBar: Navbar;
  private title: string;
  private model: string;
  private target: string;
  private urlExt: string;
  private parentId: number;
  private jsonPath: Array<{key:any,id:any}>;
  private questions: QuestionBase<any>[] | undefined;
  private uniqId: string;

  constructor(navParams: NavParams, public fns: FunctionsProvider, private navCtrl: NavController){
    this.questions = navParams.get('questions');      this.validate(this.questions,'questions');
    this.title = navParams.get('title');              this.validate(this.title, 'title');
    this.model = navParams.get('model');              this.validate(this.model, 'model');
    this.jsonPath = navParams.get('jsonPath');        this.validate(this.jsonPath, 'jsonPath');
    this.target = navParams.get('target');            this.validate(this.target, 'target');
    this.urlExt = navParams.get('urlExt');            this.validate(this.urlExt, 'urlExt');
    this.parentId = navParams.get('parentId');        this.validate(this.parentId, 'parentId');
    this.uniqId = navParams.get('uniqId');

  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(navOptionsBack);
    }
  }
  cancel(){

//    this.navCtrl.pop(navOptionsBack);

    //So far only one uniqueId is being used which is uniqId: 'tenant-home' from tenant-home.ts file.
    if(this.uniqId === 'tenant-home'){
      //this.fns.editMode = false;
      this.fns.setEditMode(false);
    }
  }
  validate(arg:any,name:any){
    if(name === 'parentId' && this.model === 'User'){
      return; //parentId is allowed to be null or empty in this case.
    }
    if(typeof arg == 'undefined' || arg == null){
      throw new Error('Invalid '+name+' passed to QuestionView:'+arg);
    }
    if(arg instanceof Array && arg.length <= 0){
      console.log('Array: '+name +' has size ' + arg.length);
    }
  }

}
