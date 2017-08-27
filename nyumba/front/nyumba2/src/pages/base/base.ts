import {Injector, OnInit, ViewChild} from '@angular/core';
import {Navbar, NavController} from 'ionic-angular';
import {QuestionViewPage} from "../question-view/question-view";
import {appInjector, Apt, JsonPath, navOptionsBack, navOptionsForward, Person, Room} from "../../interfaces/constants";
import {FunctionsProvider} from "../../providers/functions/functions";

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

  role: string;
  componentName: string;
  jsonPath: JsonPath[];
  userId:number|undefined;
  aptId:number;
  roomId:number;
  model: string;
  tgt: string;
  title: string;
  //parent: Person|Apt|Room|undefined;
  parentId: number|undefined;

  public fns: FunctionsProvider = this.injector.get(FunctionsProvider);
  public navCtrl: NavController ;

  ngOnInit(){
    this.fns.getStateObservable().shareReplay(1).subscribe(s => {
      if(s.user) {
        this.userId = s.user.id;
        this.role = s.user.claims.role;
      }
    });
  }

  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(navOptionsBack);
    }
  }

  addEdit(obj:object|undefined,fill:boolean,urlExt:string, pref: string){
    let userId:number|undefined;    this.fns.getStateObservable().take(1).subscribe(s => {if(s.user){userId = s.user.id}}); this.userId = userId;

    if(!this.valid()) return;

    this.navCtrl.push(QuestionViewPage,{
      questions: this.fns.getQuiz({tgt:this.tgt,val:obj,fill:fill}), title: pref+' '+this.title, model: this.model, target: this.tgt, parentId: this.parentId,
      jsonPath: this.fns.mapPathId(this.jsonPath,userId,this.aptId,this.roomId), urlExt: urlExt
    },navOptionsForward)
  }
  display(obj: Apt){
    if(this.valid()) this.fns.display(this.tgt,obj);
  }
  add(){
    this.addEdit(undefined,false,'/add','Add');
  }
  edit(obj:Person|Apt|Room){
    this.addEdit(obj,true,'/edit','Edit');
  }
  remove(obj:Person|Apt|Room){
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
    if((this.model == 'Bill' || this.model == 'Tenant') && (!this.userId || this.aptId || !this.roomId) ){ console.log('room must be provided'); return false;}
    //if(this.model !== 'User' && !this.parent){ console.log('parent must be provided'); return false;}
    return true;
  }
}
