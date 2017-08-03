import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Navbar, NavController, NavParams} from "ionic-angular";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {QuestionView} from "../question-view/question-view";
import {GenericView} from "../generic-view/generic-view";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {Apt, billModel, paymentsPath, Person, personsPath, Room, roomsPath, State} from "../../interfaces/consts";
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
  private unsub: Subject<void> = new Subject<void>();
  private childUnsub: Subject<void> = new Subject<void>();
  private prsnSubs: Subscription;
  private prsnPulled = false;

//  sub: any
  @ViewChild(Navbar) navBar: Navbar;

  constructor(store: Store<any>, public navCtrl: NavController, public navParams: NavParams, private fns: FunctionsProvider){
    this.state = store.select('componentReducer');
    this.user = navParams.get('user');
    this.apt = navParams.get('apt');
  }
  ngOnInit(){
    this.rooms = new Observable(observer => {
      this.state.takeUntil(this.unsub).subscribe(s => {
        let user: Person = s['users'][0];
        if(typeof s['users'][0] !== 'undefined'){
          let apts: Apt[] = user['apts'] || [];
          let apt: Apt = apts.find((apt:Apt) => apt.id === this.apt.id) || {rooms: []};
          let rooms = apt['rooms'];
          observer.next(rooms)
        }
      })
    })
  }
  ionViewDidLoad(){
    this.navBar.backButtonClick = () => {
      this.navCtrl.pop(this.fns.navOptionsBack);
    }
  }
  add(){
    this.navCtrl.push(QuestionView,{
      questions: this.fns.getQuiz({tgt:'rooms',val:null,fill:false}), title: 'New Room', model: 'Room', target: 'rooms', parentId: this.apt.id,
      jsonPath: this.fns.mapPathId(roomsPath,this.user,this.apt,null), urlExt: '/add'
    },this.fns.navOptionsForward)
  }
  remove(room:Room){

    //           ext,  parentId, data,     model,  jsonPath
    // Example: '/add','apt.id', '$event', 'Room','[user,apt,room]'
    this.fns.formOutput('/delete','',{'id':room.id},'Room',this.fns.mapPathId(roomsPath,this.user,this.apt,room.id));
  }
  tapped(room:Room,target:string): void {
    switch(target){
      case 'occupants':{
        this.childUnsub.complete();
        this.childUnsub = new Subject<void>();
        //Trigger this only if the personList was empty to begin with.
        console.log('Lenght is: '+room.personList.length);
        if(room.personList.length === 0 ) {
          console.log('Invoking prsnLsnt');
          this.prsnSubs = this.getPrsnListListener( room )
        }

        this.navCtrl.push(GenericView,{
          parent: room, name: 'Tenant', target: 'tenant', title: room.rent + ' Per Month', topInfo: {key: 'Occupants:', value: '' } ,
          topInfoClass: {'tenant-heading': true}, colsToShowArr: [{time:false, value:'firstName'},{time:false, value:'phoneNo'}],
          jsonPath: this.fns.mapPathId(personsPath,this.user,this.apt,room),
          arrayVals: this.getArrValsObs(this.fns.mapPathId(personsPath,this.user,this.apt,room),this.user)
        },this.fns.navOptionsForward);
        break;
      }
      case 'payments': {
        this.childUnsub.complete();
        this.childUnsub = new Subject<void>();
        this.navCtrl.push(GenericView,{
          parent: room, name: 'Payment', target: 'paymentDetails', colsToShowArr: [{time:true, value: 'pmtDtEpochMilli'},{value:'amt'},{value:'type'}],
          arrayVals: this.getArrValsObs(this.fns.mapPathId(paymentsPath,this.user,this.apt,room),this.user),
          topInfo: {key: 'Balance', value: this.getBalanceObservable(room) },
          jsonPath: this.fns.mapPathId(paymentsPath,this.user,this.apt,room)
        },this.fns.navOptionsForward);
        break;
      }
    }
  }
  private getBalanceObservable(room:Room): Observable<State> {
    return new Observable(observer => {
      this.state.takeUntil(this.unsub).subscribe((s:State) => {
        let _room = this.fns.findObj(s['users'], room.id, 'rooms');
        if(_room != undefined && _room != null){
          observer.next(_room.bills.length > 0 ? _room.bills[_room.bills.length -1].bal: 0)
        }
      })
    })
  }
  private getArrValsObs(jsonpath:any,user:any): Observable<State> {
    user = null; //console.log(user);
    return new Observable(observer => {
      this.state.takeUntil(this.unsub || this.childUnsub).subscribe((s:any) => {
        if(s.users.length > 0){
          observer.next(this.getArray(jsonpath,s.users[0]));
        }
      })
    })
  }
  //This is a special case function to listen and get the new list of bills when a new tenant is added to an empty room.
  private getPrsnListListener(roomArg:any): Subscription {
    return this.state.takeUntil(this.unsub).subscribe((s:State) => {

      let user = s.users[0];
      let apt = this.fns.findObj(s['users'], this.apt.id, 'apts');
      let _room = this.fns.findObj(s['users'], roomArg.id, 'rooms');

      //console.log('apt is: '+apt);
      //console.log('room is: '+_room);
      if( apt != null && _room != null && _room['personList'].length === 1 && !this.prsnPulled){
        this.prsnPulled  = true;
        console.log('length is: '+_room['personList'].length);
        console.log('step 3');
        console.log('triggered the get...');
        this.fns.httpGet('get/'+billModel+'/'+_room.id, this.fns.mapPathId(paymentsPath,user,apt,_room), 'bills');
        this.prsnSubs.unsubscribe();
      }
    });
  }
//  formatDetails(bills): any[]{
//    let mapped = bills.map( obj => {obj['pmtDtEpochMilli'] = this.datePipe.transform(obj['pmtDtEpochMilli']); return obj});
  //let myArray = new Array();
  //console.log(JSON.stringify(mapped));
//    return mapped;
//  }
  ionViewWillLeave(){
    //this.sub.unsubscribe();
  }
  getArray(path:any,user:any): any[]{
    let baseObj = user ;
    for(let i = 0 ; i < path.length; i++){
      let p = path[i+1];
      if(p.id === null || p.id === '' || i === path.length - 1 ){
        if(baseObj === undefined || baseObj[p.key] === undefined){
          return [];
        }
        else {
          return baseObj[p.key];
        }
      }else{
        baseObj = baseObj[p.key];
        //find obj for given id within current obj
        baseObj = baseObj.find((arg:any) => arg.id == p.id )
      }
    }
    return baseObj
  }
  ngOnDestroy(){
    console.log('Destroying room summary observables');
  //  this.unsub.next();
  //  this.unsub.complete();
  }

}
