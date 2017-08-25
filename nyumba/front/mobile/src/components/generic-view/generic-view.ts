import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ModalController, Navbar, NavController, NavParams} from "ionic-angular";

import {Display} from "../display/display";
import {QuestionView} from "../question-view/question-view";
import {FunctionsProvider} from "../../providers/functions";

@Component({
  selector: 'generic-view',
  templateUrl: 'generic-view.html'
})
export class GenericView implements OnInit{

  private parent: any;
  private name: string;
  private title: string;
  private jsonPath: string[];
  private target: string;
//  private state: Observable<any>;
  private valObjArr: Observable<any>[];
  private colsToShowArr: string[];
  private labels: any = {};
  private topInfo: {label: string, value: Observable<any>};
  public topInfoClass = {'tab-info': true };
  @ViewChild(Navbar) navBar: Navbar;

  constructor(navParams: NavParams, public fns: FunctionsProvider, private mdlCtrl: ModalController, private navCtrl: NavController) {
 //   this.state = store.select('componentReducer');
    //Uses for target
    // 1. To figure out which spinner to show - in reducers function
    // 2. To figure what questions to display - in questionService functions
    this.target = navParams.get('target');
    //Columns from valObjArr to be picked and displayed in the view/UI
    this.colsToShowArr = navParams.get('colsToShowArr');
    //Name of the view
    this.name = navParams.get('name');
    //The parent object of the that is being currently displayed
    this.title = navParams.get('title');
    //The title to be shown on the right side of the top panel. If missing we show name
    this.parent = navParams.get('parent');
    //The Array of objects to be displayed on the current view/UI
    this.valObjArr = navParams.get('arrayVals');
    //Any special message to be shown on top of list of objects
    this.topInfo = navParams.get('topInfo');
    //Custom class to style the topInfo. Could be custom info or title for displayed content.
    this.topInfoClass = navParams.get('topInfoClass') || {'tab-info': true };
    //The path of the array representing this object on the entire ApartmentBuilding object
    this.jsonPath = navParams.get('jsonPath');
    //this.questions = [];
    //this.subscribeToState();
  }
  ngOnInit(){
    //This is just getting labels for content to be displayed as titles for generic view
    this.fns.getQuiz({tgt:this.target,val:this.valObjArr[0],fill:false,role: this.fns.getRole()}).forEach(label => {
      this.labels[label['key']] = label['label'];
    });
  }
  public add(){
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:this.target,val:null,fill: false,role:this.fns.getRole()}),  title: 'New '+this.name, model: this.name, target: this.target, parentId: this.parent.id, jsonPath: this.jsonPath, urlExt: '/add'
    });
  }
  edit(valObj: any){
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:this.target,val:valObj,fill: true,role: this.fns.getRole()}), title: 'Edit '+this.name, model: this.name, target: this.target, parentId: this.parent.id, jsonPath: this.jsonPath, urlExt: '/edit'
    },this.fns.navOptionsForward)
  }
  remove(item: any){
    this.fns.formOutput('/delete','',{'id':item.id},this.name,this.jsonPath);
  }
  tapped(valObj: any): void {
    //This call will just get he label and value pairs for display purposes in the display details page
    let content = this.fns.getQuiz({tgt:this.target,val:valObj,fill:false,role:this.fns.getRole()});
    let mdl = this.mdlCtrl.create(Display, {content: content});
    mdl.present();
  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(this.fns.navOptionsBack);
    }
  }
  ionViewWillEnter(){
    console.log('Entering GenericView..');
    if(!this.fns.isLoggedIn()){
      this.navCtrl.popToRoot();
    }else{
      this.fns.getLoginObservable().subscribe(loggedIn => {
        if(!loggedIn) this.navCtrl.popToRoot();
      });
    }
  }
   ionViewWillLeave(){
    console.log('Leaving GenericView..');
     //this.sf.cancelEditing(this.target);
     //this.valObjArr.
     //this.topInfo['value'] = null;
   }
}

