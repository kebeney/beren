import {
  ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output,
  ViewChild
} from "@angular/core";
import { Navbar, NavController} from "ionic-angular";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {Subject} from "rxjs/Subject";
import {FunctionsProvider} from "../../providers/functions";
import {Apt, aptModel, aptsPath, Person, roomModel, State} from "../../interfaces/consts";
import {RoomsSummaryComponent} from "../../components/rooms-summary/rooms-summary";
import {QuestionView} from "../../components/question-view/question-view";

@Component({
  selector: 'page-tenant-home',
  templateUrl: 'tenant-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantHomePage implements OnInit, OnDestroy{
  user: Observable<Person>;
  state: Observable<State>;
  apts: Observable<any>;
  @ViewChild(Navbar) navBar: Navbar;
  private destroy: Subject<void> = new Subject<void>();
  //private aptSubs: Subject<void> = new Subject<void>();
  public searchUpdated: Subject<string> = new Subject<string>();
  @Output()  searchChangeEmitter: EventEmitter<any> = new EventEmitter();
  searchResults: Observable<State>;

  constructor(public store: Store<State>, public navCtrl: NavController, public fns: FunctionsProvider){
    this.state = store.select('componentReducer');
    this.searchChangeEmitter = <any>this.searchUpdated.asObservable().debounceTime(1000).distinctUntilChanged();
    this.searchChangeEmitter.takeUntil(this.destroy).subscribe((arg:string) => {
      (typeof arg == 'string' && arg.trim() != '') && this.fns.httpGet('search/'+aptModel+'/'+arg,[],'search');
    });
  }
  ngOnInit(){
    this.user = this.fns.getUserObservable();

    this.apts = new Observable(observer => {
      this.user.takeUntil(this.destroy).subscribe((u:Person) => {
        observer.next(u?u['apts']:undefined)
      });
    });

    this.searchResults = new Observable(observer => {
      this.state.takeUntil(this.destroy).subscribe((s:State) => {
        observer.next(s['searchResults']);
      });
    });
  }
  ionViewCanEnter(): Promise<boolean> {
    console.log('Trying to enter tenant-home...');
    return Promise.resolve(this.fns.isLoggedIn());
  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(this.fns.navOptionsBack);
    }
  }
  tapped(apt: Apt){
    let myUser: any;   this.user.take(1).subscribe(u => {myUser = u});

    this.navCtrl.push(RoomsSummaryComponent, {
      user: myUser, apt: apt
    },this.fns.navOptionsForward);
  }
  selectRoom(apt: Apt){
    console.log('options are',apt.landlordRooms);

    this.navCtrl.push(QuestionView,{
      //We are associating the selected room to the user at the back end and then mapping selectedRooms to tenantRooms during object retrieval.
      //Special case because we are passing a Room model to the back end but we are receiving an Apt in response.
      questions: this.fns.getQuiz({tgt:'apts',val: null,fill:true, role: 'tenant', options:apt.landlordRooms}),  title: apt.name, model: roomModel, target: 'apts', parentId: apt.id,
      jsonPath: this.getJsonPath(), urlExt: '/add', uniqId: 'tenant-home'
    });
  }
  remove(apt: Apt){
    this.fns.formOutput('/delete','',{'id':apt.id},'Building',this.getJsonPath());
  }
  getJsonPath(){
    let myUser: any; this.user.take(1).subscribe(u => {myUser = u});
    return this.fns.mapPathId(aptsPath,myUser,null,null);
  }
  ionWillLeave(){}
  ngOnDestroy(){
    this.destroy.next();
    this.destroy.complete();
  }
}

