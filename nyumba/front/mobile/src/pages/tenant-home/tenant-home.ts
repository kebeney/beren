import {ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {Events, IonicPage, Nav, Navbar, NavController, NavParams} from "ionic-angular";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {Subject} from "rxjs/Subject";
import {FunctionsProvider} from "../../providers/functions";
import {Apt, aptModel, aptsPath, EditArgs, roomModel, State} from "../../interfaces/consts";
import {UserData} from "../../providers/user-data";
import {LoginPage} from "../login/login";
import {RoomsSummaryComponent} from "../../components/rooms-summary/rooms-summary";
import {QuestionView} from "../../components/question-view/question-view";

@IonicPage()
@Component({
  selector: 'page-tenant-home',
  templateUrl: 'tenant-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantHomePage implements OnInit, OnDestroy{
  user: any;
  jsonPath: Array<{key: any,id: any}> ;
  state: Observable<State>;
  apts: Observable<any>;
  editArgs: EditArgs;
  @ViewChild(Navbar) navBar: Navbar;
//  @ViewChild(Nav) nav: Nav;
  private aptSubs: Subject<void> = new Subject<void>();
  public searchUpdated: Subject<string> = new Subject<string>();
  @Output()  searchChangeEmitter: EventEmitter<any> = new EventEmitter();
  searchResults: Observable<State>;

  constructor(public store: Store<State>, public navCtrl: NavController, public navParams: NavParams,
              public fns: FunctionsProvider, public userData: UserData, public events: Events, public nav: Nav){
    this.state = store.select('componentReducer');
    this.searchChangeEmitter = <any>this.searchUpdated.asObservable().debounceTime(1000).distinctUntilChanged();
    this.searchChangeEmitter.takeUntil(this.aptSubs).subscribe((arg:string) => {
      (typeof arg == 'string' && arg.trim() != '') && this.fns.httpGet('search/'+aptModel+'/'+arg,[],'search');
    });
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
    this.searchResults = new Observable(observer => {
      this.state.takeUntil(this.aptSubs).subscribe((s:State) => {
        observer.next(s['searchResults']);
      });
    });
  }
  ionViewCanEnter(): Promise<boolean> {
    console.log('Trying to enter tenant-home...')
    return this.userData.getUser().then(u => {
      if(u === undefined || u === null ){
        this.nav.setRoot(LoginPage);
        //this.navCtrl.setRoot(LoginPage,{},{})
        return false;
      }else {
        return true;
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
  selectRoom(apt: Apt){ //console.log('I am tapped',JSON.stringify(apt));
    this.navCtrl.push(QuestionView,{
      //TODO: Start from here. Figure out what should be returned from the back end and how to get it well displayed on the tenant's page.
      //Special case because we are passing a Room model to the back end but we are receiving an Apt in response.
      questions: this.fns.getQuiz({tgt:'apts',val: null,fill:true, role: 'tenant', options:apt.rooms}),  title: apt.name, model: roomModel, target: 'apts', parentId: apt.id,
      jsonPath: this.jsonPath, urlExt: '/add', uniqId: 'tenant-home'
    });
  }
  ionWillLeave(){}
  ngOnDestroy(){
    this.aptSubs.next();
    this.aptSubs.complete();
  }
}

