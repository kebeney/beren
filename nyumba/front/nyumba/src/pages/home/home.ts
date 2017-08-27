import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController} from 'ionic-angular';
import {Apt, aptsPath, JsonPath, navOptionsForward, State} from "../../interfaces/constants";
import {BasePage} from "../base/base";

/**
 *
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage extends BasePage implements OnInit{

  searchFields:string[] = ['name'];

  //--------constant values for specific page------------------
  title: string = 'Unit - (Building/Apt/Hse)';
  jsonPath: JsonPath[] = aptsPath;
  model: string = 'Building';
  tgt: string = 'apt';
  stateObjArr = (s:State) => { if(s.user)return s.user.apts; };

  parentId: number;
  aptId:number;
  roomId:number;

  constructor(public navCtrl: NavController){
    super();
    this.fns.getStateObservable().takeWhile(s => {
      if(s.user){ this.parentId = s.user.id; return false;
      }else return true;
    }).subscribe();
  }
  tapped(apt:Apt){
    this.navCtrl.push('RoomSummaryPage',{parentId:apt.id},navOptionsForward);
  }
}
