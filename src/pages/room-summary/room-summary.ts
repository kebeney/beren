import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import {JsonPath, navOptionsForward, Room, roomsPath} from "../../interfaces/constants";
import {BasePage} from "../base/base";
import {DisplayPage} from "../display/display";

/**
 */

@IonicPage({
  segment: 'roomSummary/:parentId'
})
@Component({
  selector: 'page-room-summary',
  templateUrl: 'room-summary.html',
})
export class RoomSummaryPage extends BasePage{

  //--------constant values for specific page------------------
  title: string = 'Rooms/Sub units';
  jsonPath: JsonPath[] = roomsPath;
  model: string = 'Room';
  tgt: string = 'rooms';

  //--------dynamic values for specific page------------------
  objArray: Observable<Room[]|undefined>;
  //parent: Person|Apt|Room|undefined;
  parentId: number|undefined;
  //apt:Apt|undefined;
  room:Room|undefined;

  constructor(public navCtrl: NavController,public navParams: NavParams){
    super();
    this.parentId = navParams.get('parentId');
    console.log('parentId:'+this.parentId);
    if(this.parentId)this.aptId = this.parentId;

    if(!this.parentId){
      this.parentId = this.navParams.data.parentId;
    }
    console.log(this.navParams);
  }
  ngOnInit(){
    super.ngOnInit();
    this.objArray = this.fns.getStateObservable().map(s => {

      console.log('Room Summary..');
      if(s.user && s.user.apts && this.aptId) {
        let id = this.aptId;
        let lApt = s.user.apts.find(a => a.id == id);
        if(lApt){
          return  this.role == 'landlord' ? lApt['landlordRooms']:lApt['tenantRooms'];
        }
      }
    }).shareReplay(1);
  }
  tapped(room:Room){
    //TODO: change this to the right nav componetn
    this.navCtrl.push(DisplayPage,{'apt':room},navOptionsForward);
  }
}
