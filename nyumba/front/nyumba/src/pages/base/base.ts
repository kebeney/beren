import {Injector, OnInit, ViewChild} from '@angular/core';
import {List, Navbar, NavController} from 'ionic-angular';
import {QuestionViewPage} from "../question-view/question-view";
import {
  appInjector, Apt, JsonPath, navOptionsBack, navOptionsForward, Person, Room,
  State
} from "../../interfaces/constants";
import {FunctionsProvider} from "../../providers/functions/functions";
import {Subscription} from "rxjs/Subscription";

/**
 */


// @IonicPage()
// @Component({
//   selector: 'page-base',
//   templateUrl: 'base.html',
// })
export abstract class BasePage implements OnInit{

  @ViewChild(Navbar) navBar: Navbar;
  private injector: Injector = appInjector();
  public fns: FunctionsProvider = this.injector.get(FunctionsProvider);

  @ViewChild('objList', { read: List }) objList: List;
  subscription:Subscription = new Subscription();
  queryText = '';
  objArray: Array<any>;

  //Set this only on the base class.
  role: string;
  userId:number;

  //Must set this in every child class
  abstract jsonPath: JsonPath[];
  abstract model: string;
  abstract tgt: string;
  abstract title: string;
  abstract parentId: number;
  abstract navCtrl: NavController ;

  //Must supply this to provide the location of correct array in the state object.
  abstract stateObjArr: (s:State) => any;
  //List of search fields for the specific sub class
  abstract searchFields:string[];

  //These are optional based on sub class.
  aptId:number;
  roomId:number;


  ngOnInit(){
    this.fns.getStateObservable().subscribe(s => {
      if(s.user) {
        this.userId = s.user.id;
        this.role = s.user.claims.role;
      }
    });
  }

  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(navOptionsBack);
    };
    this.updateSchedule();
  }

  searcherFilter = (objArray:any[],queryWords: Array<string>) => {

    return objArray.map((obj:any) => {

      let queryMatches: boolean = false;

      if(queryWords.length > 0 && this.searchFields.length > 0){
        this.searchFields.forEach((field:string) => {
          queryWords.forEach(word => {
            if(obj[field].toLowerCase().indexOf(word) > -1 ) queryMatches = true;
          });
        });
      }else{
        queryMatches = true;
      }
      obj['hide'] = !queryMatches;
      return obj;
    });
  };

  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.objList && this.objList.closeSlidingItems();

    this.queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    let queryWords = this.queryText.split(' ').filter(w => !!w.trim().length);

    this.subscription.unsubscribe();
    this.subscription = this.fns.getStateObservable().subscribe((s:State) => {
      if(s.user){
        this.objArray = this.searcherFilter(this.stateObjArr(s),queryWords);
      }
    });
  }

  addEdit(obj:object|undefined,fill:boolean,urlExt:string, pref: string){
    this.objList && this.objList.closeSlidingItems();
    if(!this.valid()) return;

    this.navCtrl.push(QuestionViewPage,{
      questions: this.fns.getQuiz({tgt:this.tgt,val:obj,fill:fill,role:this.role}), title: pref+' '+this.title, model: this.model, target: this.tgt, parentId: this.parentId,
      jsonPath: this.fns.mapPathId(this.jsonPath,this.userId,this.aptId,this.roomId), urlExt: urlExt
    },navOptionsForward)
  }
  display(obj: Apt){
    this.objList && this.objList.closeSlidingItems();
    if(this.valid()) this.fns.display(this.tgt,obj);
  }
  add(){
    this.addEdit(undefined,false,'/add','Add');
  }
  edit(obj:Person|Apt|Room){
    this.addEdit(obj,true,'/edit','Edit');
  }
  remove(obj:Person|Apt|Room){
    this.objList && this.objList.closeSlidingItems();
    if(this.valid())
      this.fns.formOutput({ext:'/delete',parentId:this.parentId,obj:{'id':obj.id}, model:this.model,jsonPath:this.fns.mapPathId(this.jsonPath,this.userId,this.aptId,this.roomId)});
  }
  valid():boolean{
    if(!this.title){console.log('Title must be provided') ; return false;}
    if(!this.tgt) { console.log('tgt must be provided'); return false;}
    if(!this.role) { console.log('role must be provided'); return false;}
    if(!this.jsonPath) { console.log('jsonPath must be provided'); return false;}
    if(!this.userId) { console.log('user must be provided'); return false;}

    if(this.model == 'Building' && !this.userId){ console.log('apt must be provided'); return false;}
    if(this.model == 'Room' && (!this.userId || !this.aptId)){ console.log('apt must be provided'); return false;}
    if((this.model == 'Bill' || this.model == 'Tenant') && (!this.userId || !this.aptId || !this.roomId) ){ console.log('room must be provided'); return false;}
    //if(this.model !== 'User' && !this.parent){ console.log('parent must be provided'); return false;}
    return true;
  }
}
