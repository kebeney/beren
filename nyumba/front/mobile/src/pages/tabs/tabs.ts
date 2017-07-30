import { Component } from '@angular/core';

import {NavParams} from 'ionic-angular';

import { AboutPage } from '../about/about';
import { MapPage } from '../map/map';
//import { SpeakerListPage } from '../speaker-list/speaker-list';
//import {ApartmentPage} from "../apartment/apartment";
//import {TenantHomePage} from "../tenant-home/tenant-home";
import {HomePage} from "../home/home";
import {SchedulePage} from "../schedule/schedule";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tabs: any[] = [];
  tab1Root: any = HomePage;
  tab2Root: any = SchedulePage;
  tab3Root: any = MapPage;
  tab4Root: any = AboutPage;
//  tab5Root: any = AboutPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    // let user = navParams.get('user');
    // console.log(user);
    //
    // if(typeof user != 'undefined' && typeof user.claims != 'undefined'){
    //   if(user.claims.role == 'landlord'){
    //     this.tabs.push({name: ApartmentPage, title: 'Apts', icon: 'home'});
    //   }else if(user.claims.role == 'tenant'){
    //     this.tabs.push({name: TenantHomePage, title: 'Home', icon: 'home'});
    //   }
    // }
    // //this.tabs.push({name: TenantHomePage, title: 'Home', icon: 'home'});
    //
    // this.tabs.push({name: SchedulePage, title: 'Schedule', icon: 'calendar'});
    // this.tabs.push({name: MapPage, title: 'Map', icon: 'map'});
    // this.tabs.push({name: AboutPage, title: 'About', icon: 'information-circle'});

    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }
  ionViewDidLoad(){
  }

}
