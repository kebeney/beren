import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Apt, JsonPath, navOptionsForward, Room, roomsPath, State} from "../../interfaces/constants";
import {BasePage} from "../base/base";

/**
 *
 */

@IonicPage()
@Component({
  selector: 'page-room-summary',
  templateUrl: 'room-summary.html',
})
export class RoomSummaryPage extends BasePage{

  segment: string = 'all';

  searchFields:string[] = ['name'];

  //--------constant values for specific page------------------
  title: string = 'Rooms Summary';
  jsonPath: JsonPath[] = roomsPath;
  model: string = 'Room';
  tgt: string = 'room';

  stateObjArr = (s:State) => {
    if(s.user){

      let apt: Apt|undefined = s.user.apts.find(a => a.id === this.parentId);
      if(apt){
        return this.role === 'landlord' ? apt['landlordRooms'] : apt['tenantRooms'];
      }
    }
  };

  parentId: number;
  aptId: number;
  roomId: number;

  constructor(public navCtrl: NavController, public navParams: NavParams){
    super();
    this.parentId = navParams.get('parentId');
    this.aptId = this.parentId;

  }
  tapped(room:Room,page:string){
    switch(page){
      case 'tenants': {this.navCtrl.push('TenantsPage',{parentId:room.id, aptId: this.aptId},navOptionsForward); return;}
      case 'payments': {this.navCtrl.push('PaymentsPage',{parentId:room.id, aptId: this.aptId},navOptionsForward); return;}
    }
  }

  //Override the search filter lambda function to accommodate for the lapsed tab.

  searcherFilter = (objArray:any[],queryWords: Array<string>) => {

    return objArray.map((obj:any) => {

      let queryMatches: boolean = false;
      let segmentMatch: boolean = false;

      if(queryWords.length > 0 && this.searchFields.length > 0){
        this.searchFields.forEach((field:string) => {
          queryWords.forEach(word => {
            if(obj[field].toLowerCase().indexOf(word) > -1 ) queryMatches = true;
          });
        });
      }else{
        queryMatches = true;
      }
      if(this.segment == 'lapsed'){
        if(obj.bills && obj.bills.length > 0 && obj.bills[obj.bills.length -1 ].bal > 0){
          segmentMatch = true;
        }
      }else{
        segmentMatch = true;
      }
      obj['hide'] = !(queryMatches && segmentMatch);
      return obj;
    });
  };

}
