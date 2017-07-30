import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {QuestionView} from "../question-view/question-view";
import {RoomsSummaryComponent} from "../rooms-summary/rooms-summary";
import {Apt, aptModel, aptsPath, EditArgs, Person, roomModel, State} from "../../interfaces/consts";
import {NavController} from "ionic-angular";
import {FunctionsProvider} from "../../providers/functions";
import {Observable} from "rxjs/Observable";
import {Store} from "@ngrx/store";
import {Subject} from "rxjs/Subject";


@Component({
  selector: 'tenant-section',
  templateUrl: 'tenant-section.html'
})
export class TenantSectionComponent implements OnInit{

  editArgs: EditArgs;

  user: Person;
  jsonPath: Array<{key: any,id: any}> ;

  private stop: Subject<void> = new Subject<void>();
  public searchUpdated: Subject<string> = new Subject<string>();

  apts: Observable<any>;
  state: Observable<State>;
  searchResults: Observable<State>;


  @Output()  searchChangeEmitter: EventEmitter<any> = new EventEmitter();

  text: string;

  constructor(public navCtrl: NavController, public fns: FunctionsProvider, store: Store<State>) {
    this.state = store.select('componentReducer');
    this.searchChangeEmitter = <any>this.searchUpdated.asObservable().debounceTime(1000).distinctUntilChanged();
    this.searchChangeEmitter.takeUntil(this.stop).subscribe((arg:string) => {
      (typeof arg == 'string' && arg.trim() != '') && this.fns.httpGet('search/'+aptModel+'/'+arg,[],'search');
    });
  }
  ngOnInit(){
    this.searchResults = new Observable(observer => {
      this.state.takeUntil(this.stop).subscribe((s:State) => {
        observer.next(s['searchResults']);
      });
    });
    this.apts = new Observable(observer => {
      this.state.takeUntil(this.stop).subscribe((s:State) => {

        if( s.users instanceof Array && s.users.length > 0 && s.users[0]['apts'] instanceof Array){
          this.user = s.users[0];
          this.jsonPath = this.fns.mapPathId(aptsPath,this.user,null,null);
          this.editArgs = { title: 'Edit Apartment', model: 'Building',target:'apts',parentId:this.user.id,jsonPath:this.jsonPath };
          observer.next(s.users[0]['apts']);
        }

      })
    });
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

}
