import {Component, ViewChild} from '@angular/core';
import {Navbar, NavController, NavParams} from "ionic-angular";
import {FunctionsProvider} from "../../providers/functions";
import {QuestionBase} from "../../providers/questions/question-base";

@Component({
  selector: 'question-view',
  templateUrl: 'question-view.html'
})
export class QuestionView {
  @ViewChild(Navbar) navBar: Navbar;
  private title: string;
  private model: string;
  private target: string;
  private urlExt: string;
  private parentId: number;
  private jsonPath: Array<{key:any,id:any}>;
  private questions: QuestionBase<any>[];
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
  ionViewWillEnter(){
    console.log('Entering QuestionView..');
    if(!this.fns.isLoggedIn()){
      this.navCtrl.popToRoot();
    }
  }
  ionViewWillLeave(){
    console.log('Leaving QuestionView');
  }
  ionViewDidLoad(){
    // this.navBar.backButtonClick = () => {
    //   this.navCtrl.pop(this.sf.navOptionsBack);
    // }
  }
  cancel(){

    this.navCtrl.pop(this.fns.navOptionsBack);

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
