import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController} from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import {Apt, aptsPath, JsonPath, navOptionsForward, Room} from "../../interfaces/constants";
import {BasePage} from "../base/base";
//import {RoomSummaryPage} from "../room-summary/room-summary";

/**
 *
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage extends BasePage implements OnInit{

  //--------constant values for specific page------------------
  title: string = 'Building/Apt/Hse/Unit';
  jsonPath: JsonPath[] = aptsPath;
  model: string = 'Building';
  tgt: string = 'apts';

  //--------dynamic values for specific page------------------
  objArray: Observable<Apt|undefined>;
  //parent: Person|Apt|Room|undefined;
  parentId: number|undefined;
  apt:Apt|undefined;
  room:Room|undefined;

  constructor(public navCtrl: NavController){
    super()
  }
  ngOnInit(){
    super.ngOnInit();
    this.objArray = this.fns.getStateObservable().map(s => {
      if(s.user) {
        //this.parent = s.user;
        this.parentId = s.user.id;
        return  s.user.apts
      }
    }).shareReplay(1);
  }
  tapped(apt:Apt){
    //this.navCtrl.push('SessionDetailPage', { sessionId: session.id });
    console.log('aptId:'+apt.id);
    this.navCtrl.push('RoomSummaryPage',{parentId:apt.id},navOptionsForward);
  }
}
