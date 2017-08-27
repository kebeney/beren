import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {JsonPath, personsPath, Room, State} from "../../interfaces/constants";
import {BasePage} from "../base/base";

/**
 * Generated class for the TenantsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tenants',
  templateUrl: 'tenants.html',
})
export class TenantsPage extends BasePage {


  searchFields:string[] = ['firstName','lastName','phoneNo'];

  //--------constant values for specific page------------------
  title: string = 'Tenants';
  jsonPath: JsonPath[] = personsPath;
  model: string = 'Tenant';
  tgt: string = 'tenant';
  stateObjArr = (s:State) => {
    //A user who is a tenant should not be having access to this page so we ignore when role is 'tenant'.
    let propToFind: string = this.role == 'landlord' ? 'landlordRooms':'tenantRooms';
    let room:Room = this.fns.findObj(s.user,this.roomId,propToFind);
    if(room) return room['personList'];
    //if(s.user)return s.user.apts;
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
