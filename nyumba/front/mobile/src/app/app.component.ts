import { Component, ViewChild } from '@angular/core';

import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import {Store} from "@ngrx/store";
import {FunctionsProvider} from "../providers/functions";
import {SchedulePage} from "../pages/schedule/schedule";
import {HomePage} from "../pages/home/home";
import {SEND_MESSAGE, State} from "../interfaces/consts";
import {Observable} from "rxjs/Observable";

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@Component({
  templateUrl: 'app.template.html'
})
export class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;
  public state: Observable<State>;
  public isLoggedIn: Observable<boolean>;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    { title: 'Home', name: 'TabsPage', component: TabsPage, tabComponent: HomePage, index: 0, icon: 'home' },
//    { title: 'Schedule', name: 'TabsPage', component: TabsPage, tabComponent: SchedulePage, index: 1, icon: 'calendar' },
//    { title: 'Payment', name: 'TabsPage', component: TabsPage, tabComponent: PaymentsPage, index: 0, icon: 'logo-usd' },
    { title: 'Account', name: 'TabsPage', component: TabsPage, tabComponent: AccountPage, index: 1, icon: 'person' },
    { title: 'Map', name: 'TabsPage', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map' },
    { title: 'About', name: 'TabsPage', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'information-circle' },
    { title: 'Schedule', name: 'TabsPage', component: TabsPage, tabComponent: SchedulePage, index: 4, icon: 'contacts' }
  ];
  loggedInPages: PageInterface[] = [
    { title: 'Account', name: 'AccountPage', component: AccountPage, icon: 'person' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Logout', name: 'TabsPage', component: TabsPage, icon: 'log-out', logsOut: true, tabComponent: LoginPage}
  ];
  loggedOutPages: PageInterface[] = [
    //{ title: 'Login', name: 'LoginPage', component: TabsPage, icon: 'log-in', tabComponent: HomePage },
    { title: 'Login', name: 'TabsPage', component: TabsPage, tabComponent: HomePage, icon: 'log-in' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' }
//    { title: 'Signup', name: 'SignupPage', component: SignupPage, icon: 'person-add' }
  ];
  rootPage: any;

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    public platform: Platform,
    public confData: ConferenceData,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public store: Store<State>,
    public fns: FunctionsProvider
  ) {
    this.state = this.store.select('componentReducer');

    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
        if (hasSeenTutorial) {
          this.rootPage = TabsPage;
          console.log('Setting rootPage to HomePage...')
          //this.rootPage = HomePage;
        } else {
          this.rootPage = TutorialPage;
        }
        this.platformReady()
      });

    // load the conference data
    confData.load();

    this.listenToLoginEvents();
  }

  openPage(page: PageInterface) {
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }
    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if(page.logsOut){
      //logout button explicitly clicked.dispatch the logout message
      this.store.dispatch({type: SEND_MESSAGE, payload: {msg: 'logout'}})
    }
    else if (this.nav.getActiveChildNav() && page.index != undefined) {
      this.nav.getActiveChildNav().select(page.index);
    // Set the root of the nav with params if it's a tab index
  } else {
      console.log('Setting root to: '+page.name);
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

  listenToLoginEvents() {
    this.isLoggedIn = this.fns.getLoginObservable();
    // this.isLoggedIn = new Observable(observer => {
    //   this.state.subscribe(s => {
    //     if(s['msg'] !== null && s['msg'] === 'loginComplete'){
    //       observer.next(true);
    //     }else if(s['msg'] != null && s['msg'] === 'logoutComplete'){
    //       observer.next(false);
    //     }
    //   });
    // });
  }

  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNav();

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary';
    }
    return;
  }
}
