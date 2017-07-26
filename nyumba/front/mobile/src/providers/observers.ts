import {Injectable, OnDestroy} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Store} from "@ngrx/store";
import { State} from "../interfaces/consts";
import {Observable} from "rxjs/Observable";
import {UserData} from "./user-data";
import {Subject} from "rxjs/Subject";

/*
  Generated class for the ObserversProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ObserversProvider implements OnDestroy{

  state: Observable<State>;
  private unSub: Subject<void> = new Subject<void>();
  constructor(public http: Http, store: Store<any>, private userData: UserData) {
    this.state = store.select('componentReducer');
  }

  register(){
    console.log('Registering observers...')
    this.state.takeUntil(this.unSub).subscribe(s => {
      if(s['persist']){this.userData.hasLoggedIn()
        //this.userData.setUser(s['users'][0]);
        //this.store.dispatch({type: RESET_PERSIST});
      }
    });
  }

  ngOnDestroy(){
    console.log('Destroying registered observers');
    this.unSub.next();
    this.unSub.complete();
  }
}
