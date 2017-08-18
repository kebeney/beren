
'use strict';

import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicPage} from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import {FunctionsProvider} from "../../providers/functions";

/**
 *Home page that will route to the right page based on the role of the logged in user.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit, OnDestroy{
  isLoggedIn: Observable<boolean>;
  showing: boolean = false;

  constructor(public fns: FunctionsProvider) {
  }
  ngOnInit(){
    this.isLoggedIn = this.fns.getLoginObservable();
  }
  ionViewDidLoad(){
    let loggedIn = false;
    this.isLoggedIn.take(1).subscribe(v => { loggedIn = v; });
    if(!loggedIn) this.fns.restoreUser();
  }
  ngOnDestroy(){
    console.log('Destroying the home page');
  }
}
