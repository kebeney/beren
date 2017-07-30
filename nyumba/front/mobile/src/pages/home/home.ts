import {Component  } from '@angular/core';
import {Events, IonicPage} from 'ionic-angular';
import {State} from "../../interfaces/consts";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {FunctionsProvider} from "../../providers/functions";
import {Subject} from "rxjs/Subject";

/**
 *Home page that will route to the right page based on the role of the logged in user.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  loggedIn: boolean = false;
  role: string = '';
  state: Observable<State>;
  //----------------------------------------------------------
  editModeEvent: Subject<boolean> = new Subject<boolean>();
  editMode: Observable<boolean>;

  constructor(events: Events, store: Store<State>, public fns: FunctionsProvider
    //public navCtrl: NavController, public userData: UserData, public auth: AuthProvider,  private store: Store<State>,

  ) {
    this.state = store.select('componentReducer');

    this.editMode = this.editModeEvent.asObservable();

    this.state.subscribe((s:State) => {
      if(s['msg'] == 'loginSuccess'){
        this.loggedIn = true;
        this.role = s['users'][0].claims.role ;
        events.publish('user:login');
      }
    });
  }
}
