import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Events, IonicPage, Nav, Navbar, NavController, NavParams} from "ionic-angular";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {Subject} from "rxjs/Subject";
import {QuestionView} from "../../components/question-view/question-view";
import {FunctionsProvider} from "../../providers/functions";
import {Apt, aptsPath, EditArgs, State} from "../../interfaces/consts";
import {UserData} from "../../providers/user-data";
import {LoginPage} from "../login/login";
import {RoomsSummaryComponent} from "../../components/rooms-summary/rooms-summary";

@IonicPage()
@Component({
  selector: 'page-apartment',
  templateUrl: 'apartment.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApartmentPage implements OnInit, OnDestroy{
  user: any;
  jsonPath: Array<{key: any,id: any}> ;
  state: Observable<State>;
  apts: Observable<any>;
  editArgs: EditArgs;
  @Input() editMode: Observable<boolean>;
  @ViewChild(Navbar) navBar: Navbar;
//  @ViewChild(Nav) nav: Nav;
  private aptSubs: Subject<void> = new Subject<void>();

  constructor(public store: Store<State>, public navCtrl: NavController, public navParams: NavParams,
              public fns: FunctionsProvider, public userData: UserData, public events: Events, public nav: Nav){
    this.state = store.select('componentReducer');
   // this.add
  }
  ngOnInit(){
    this.apts = new Observable(observer => {
      this.state.takeUntil(this.aptSubs).subscribe((s:State) => {

        if( s.users instanceof Array && s.users.length > 0 && s.users[0]['apts'] instanceof Array){
          this.user = s.users[0];
          this.jsonPath = this.fns.mapPathId(aptsPath,this.user,null,null);
          this.editArgs = { title: 'Edit Apartment', model: 'Building',target:'apts',parentId:this.user.id,jsonPath:this.jsonPath }
          observer.next(s.users[0]['apts']);
        }

      })
    })
  }
  add(){
    console.log('Adding apartment!');
    console.log(this.navCtrl.length());
    console.log(this.navCtrl.first().id);
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:'apts',val:null,fill:false}), title: 'New Apartment', model: 'Building', target: 'apts', parentId: this.user.id,
      jsonPath: this.fns.mapPathId(aptsPath,this.user,null,null), urlExt: '/add'
    },this.fns.navOptionsForward).then(u => {
      console.log('Fulfilled',u);
    }).catch(reason => {
      console.log('Rejected:',reason);
    });
    console.log('End of function...');
  }
  edit(valObj: any){
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:'apts',val:valObj,fill:true}), title: 'Edit Apartment', model: 'Building', target: 'apts', parentId: this.user.id,
      jsonPath: this.fns.mapPathId(aptsPath,this.user,null,null), urlExt: '/edit'
    },this.fns.navOptionsForward)
  }
  remove(apt: any){
    this.fns.formOutput('/delete','',{'id':apt.id},'Building',this.fns.mapPathId(aptsPath,this.user,apt,null));
  }
  ionViewCanEnter(): Promise<boolean> {
    return this.userData.getUser().then(u => {
      if(u === undefined || u === null ){
        this.nav.setRoot(LoginPage);
        //this.navCtrl.setRoot(LoginPage,{},{})
        return Promise.resolve(false);
      }else {
        return Promise.resolve(true);
      }
    });
  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(this.fns.navOptionsBack);
    }
  }
  tapped(apt: Apt){
    this.navCtrl.push(RoomsSummaryComponent, {
      user: this.user, apt: apt
    },this.fns.navOptionsForward);
  }
  ionWillLeave(){}
  ngOnDestroy(){
    this.aptSubs.next();
    this.aptSubs.complete();
  }
}

