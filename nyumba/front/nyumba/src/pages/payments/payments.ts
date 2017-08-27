import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {BasePage} from "../base/base";
import {JsonPath, paymentsPath, Room, State} from "../../interfaces/constants";

/**
 *
 */

@IonicPage()
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html',
})
export class PaymentsPage extends BasePage {


  searchFields:string[] = ['status','bal','description'];

  //--------constant values for specific page------------------
  title: string = 'Bills And Payments';
  jsonPath: JsonPath[] = paymentsPath;
  model: string = 'Payment';
  tgt: string = 'payment';
  stateObjArr = (s:State) => {
    let propToFind: string = this.role == 'landlord' ? 'landlordRooms':'tenantRooms';
    let room:Room = this.fns.findObj(s.user,this.roomId,propToFind);
    if(room) return room['bills'];
  };

  parentId: number;
  aptId:number;
  roomId:number;

  constructor(public navCtrl: NavController, public params: NavParams){
    super();
    this.parentId = params.get('parentId');
    this.aptId = params.get('aptId');
    this.roomId = this.parentId;
  }

}
