import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Navbar, NavController, NavParams} from "ionic-angular";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {QuestionView} from "../question-view/question-view";
import {GenericView} from "../generic-view/generic-view";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {
  Apt, billModel, landlordRole, paymentsPath, Person, personsPath, Room, roomsPath, State
} from "../../interfaces/consts";
import {FunctionsProvider} from "../../providers/functions";

@Component({
  selector: 'rooms-summary',
  templateUrl: 'rooms-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomsSummaryComponent implements OnInit, OnDestroy{
  state: Observable<State>;
  user: any;
  apt: any;
  rooms: Observable<State>;
  balanceObs: Observable<any>;
  arrayValsObs: Observable<any>;
  private destroy: Subject<void> = new Subject<void>();
  private prsnSubs: Subscription;
  private prsnPulled = false;

//  sub: any
  @ViewChild(Navbar) navBar: Navbar;

  constructor(store: Store<State>, public navCtrl: NavController, public navParams: NavParams, private fns: FunctionsProvider){
    this.state = store.select('componentReducer');
    this.user = navParams.get('user');
    this.apt = navParams.get('apt');
  }
  ngOnInit(){
    this.rooms = new Observable(observer => {
      this.state.takeUntil(this.destroy).subscribe(s => {
        let user: Person = s['users'][0];
        let role: string = this.fns.getRole() ;
        if(typeof s['users'][0] !== 'undefined'){
          let apts: Apt[] = user['apts'] || [];
          let apt: Apt = apts.find((apt:Apt) => apt.id === this.apt.id) || {landlordRooms: [], tenantRooms: []};
          let rooms = role === landlordRole ? apt['landlordRooms']: apt['tenantRooms'] ;
          observer.next(rooms)
        }
      })
    })
  }
  ionViewWillEnter(){
    console.log('Entering RoomSummaryPage..');
    if(!this.fns.isLoggedIn()){
      this.navCtrl.popToRoot();
    }
  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(this.fns.navOptionsBack);
    }
  }
  add(){
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:'rooms',val:null,fill:false,role: this.fns.getRole()}), title: 'New Room', model: 'Room', target: 'rooms', parentId: this.apt.id,
      jsonPath: this.fns.mapPathId(roomsPath,this.user,this.apt,null), urlExt: '/add'
    },this.fns.navOptionsForward)
  }
  remove(room:Room){

    //           ext,  parentId, data,     model,  jsonPath
    // Example: '/add','apt.id', '$event', 'Room','[user,apt,room]'
    this.fns.formOutput('/delete','',{'id':room.id},'Room',this.fns.mapPathId(roomsPath,this.user,this.apt,room));
  }
  tapped(room:Room,target:string): void {

    switch(target){
      case 'occupants':{
        //Trigger this only if the personList was empty to begin with.
        console.log('Length is: '+room.personList.length);
        if(room.personList.length === 0 ) {
          console.log('Invoking prsnLsnt');
          this.prsnSubs = this.getPrsnListListener( room )
        }

        let jsonPath  = this.fns.mapPathId(personsPath,this.user,this.apt,room);
        //Find landlordRoom with given roomId then result the personList property
        this.arrayValsObs = this.fns.getArrayObs(this.fns.getRole() === landlordRole? 'landlordRooms':'tenantRooms',room.id || -1,'personList',this.destroy);

        this.navCtrl.push(GenericView,{
          parent: room, name: 'Tenant', target: 'tenant', title: room.rent + ' Per Month', topInfo: {key: 'Occupants:', value: '' } ,
          topInfoClass: {'tenant-heading': true}, colsToShowArr: [{time:false, value:'firstName'},{time:false, value:'phoneNo'}],
          jsonPath: jsonPath, arrayVals: this.arrayValsObs
        },this.fns.navOptionsForward);
        break;
      }
      case 'payments': {

        let jsonPath = this.fns.mapPathId(paymentsPath,this.user,this.apt,room);
        this.arrayValsObs = this.fns.getArrayObs(this.fns.getRole() === landlordRole? 'landlordRooms':'tenantRooms',room.id || -1,'bills',this.destroy);
        //this gets the balance observable for the selected room.
        this.balanceObs = new Observable(observer => { this.arrayValsObs.subscribe((bills:Array<any>) => {observer.next(bills.length > 0 ? bills[bills.length -1].bal: 0)});});

        this.navCtrl.push(GenericView,{
          parent: room, name: 'Payment', target: 'paymentDetails', colsToShowArr: [{time:true, value: 'pmtDtEpochMilli'},{value:'amt'},{value:'status'}],
          arrayVals: this.arrayValsObs, topInfo: {key: 'Balance', value: this.balanceObs }, jsonPath: jsonPath
        },this.fns.navOptionsForward);
        break;
      }
    }
  }
  //This is a special case function to listen and get the new list of bills when a new tenant is added to an empty room.
  private getPrsnListListener(roomArg:Room): Subscription {
    return this.state.takeUntil(this.destroy).subscribe((s:State) => {
      let role = this.fns.getRole();
      let user = s.users[0];
      let apt = this.fns.findObj(s['users'], this.apt.id, 'apts');
      console.log('Finding room');
      let _room = this.fns.findObj(s['users'], roomArg.id, role === landlordRole ? 'landlordRooms':'tenantRooms');

      if( apt != null && _room != null && _room['personList'].length === 1 && !this.prsnPulled){
        this.prsnPulled  = true;
        this.fns.httpGet('get/'+billModel+'/'+_room.id, this.fns.mapPathId(paymentsPath,user,apt,_room), 'bills');
        this.prsnSubs.unsubscribe();
      }
    });
  }
  ionViewWillLeave(){
    console.log('Leaving RoomSummaryPage')
    //this.sub.unsubscribe();
  }
  ngOnDestroy(){
    console.log('Destroying room summary observables');
    //this.destroy.next();
    this.destroy.complete();
    this.destroy.unsubscribe();
   // this.unsub.
  }

}
