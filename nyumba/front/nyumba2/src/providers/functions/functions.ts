import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {
  Action, Apt, HTTP_CALL, JsonPath, LabelValueType, landlordRole, QuizPayLType, RESTORE_USER, Room,
  SET_EDIT_MODE, State,ServerPL
} from "../../interfaces/constants";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {AlertController, Loading, LoadingController, ModalController} from "ionic-angular";
import {Headers} from "@angular/http";
import {ToastProvider} from "../toast/toast";
import {UserDataProvider} from "../user-data/user-data";
import {QuestionsProvider} from "../questions/questions";
import {QuestionBase} from "../questions/question-base";
import {DisplayPage} from "../../pages/display/display";

/**
 * @Author Kip.
 * @Date 8/19/2017
*/
@Injectable()
export class FunctionsProvider {

  public editMode: Observable<boolean>;

  private state: Observable<State>;
  private appCompLoginOut: Observable<string>;
  private loading: Loading;

  //values emitted only to specific listeners i.e loginOut or persist to everyone.
  private loginOutMsg: Array<string> = ['loginSuccess','logout','Session Expired'];
  private persistMsg: Array<string> =  ['loginSuccess','logout','deleted'];
  private dispIgnore: Array<string> =  ['loginSuccess','logout','deleted'];

  //values will be emitted to all listeners under all cases except when msg is one of below.
  private stateEmitExceptMsg: Array<string> =  ['logout','Session Expired'];

  private headers = new Headers({'Content-type': 'application/json'});

  constructor(public store: Store<any>, private ldgCtrl: LoadingController, private toast: ToastProvider,private userData:UserDataProvider,
              private questions: QuestionsProvider,private alertCtrl: AlertController, private mdlCtrl: ModalController) {
    this.editMode = this.getStateObservable().map(s => { console.log('editMode'); return s.editMode}).shareReplay(1);
  }

  /** This all subscribers in the app should use this observable and filter accordingly.
   * The observable does not emit if message is 'login' or 'logout'. These special events are handled by
   * the loginOut observable and nothing else should be emitted whenever those are emitted.
   * @returns {Observable<State>} - observable with next state.
   */
  getStateObservable(): Observable<State>{
    if(!this.state){
      console.log('Creating state observable');
      this.state = new Observable(observer => {
        this.store.select(reducers => reducers.stateReducer).subscribe((s:State) => {
          //if msg is logout, then don't emit anything.
          if(!this.stateEmitExceptMsg.find(e => e == s.msg) ){
            console.log('Next state');
            observer.next(s);
          }
        });
      }).shareReplay(1);
    }
    console.log('Fetching state observable');
    return this.state ;
  }
  isLoggedIn():Observable<boolean>{
    return Observable.of();
  }

  /**
   * 1. This observable listens to login/logout events. It should be invoked only from the app.component.ts and nowhere else.
   * 2. We also listen to other messages here and invoke the toast whenever the message is neither login nor logout.
   * 3. The login/logout message should also trigger a sync of local state. We do that here depending on whether 'user' object in
   *    the state has a value or is undefined.
   * @returns {Observable<string>} - to pass a login or logout message.
   */
  getAppComponentLoginObservable(): Observable<string>{
    if(!this.appCompLoginOut ){
      this.appCompLoginOut = new Observable(observer => {
        this.store.select(reducers => reducers.stateReducer).subscribe((s:State) => {
          //only emit and sync localState if msg is 'login' or 'logout'. Otherwise display msg to toast.
          if(this.loginOutMsg.find(e => e == s.msg)){
            observer.next(s.msg);
          }
          if(!this.dispIgnore.find(e => e == s.msg)){
            this.toast.showMsg(s.msg)
          }
          if(this.persistMsg.find(e => e == s.msg)){
            this.userData.syncLocal(s.user);
          }
        })
      }).shareReplay(1)
    }
    return this.appCompLoginOut;
  }

  //           ext,  parentId, data,     model, jsonPath
//Example: '/add','apt.id', '$event', 'Room','[user,apt,room]'
  formOutput(pl:ServerPL){

    FunctionsProvider.validatePath(pl.jsonPath);

    if(pl.model === 'Payment') {  let date = new Date(pl.obj['pmtDtEpochMilli']);  pl.obj['pmtDtEpochMilli'] = date.getTime(); }

    pl.obj['parentId'] = pl.parentId;
    let uData = {'type': pl.model, 'data': pl.obj};

    if( pl.ext.endsWith('login') || pl.ext.endsWith('signup') || this.setAuthorization()){
      console.log('Dispatching HTTP_CALL');
      //Present a confirmation alert if it is a delete of the object.
      if(pl.ext.endsWith('delete')){
        let fun = (proceed:boolean):void =>  {
          if(proceed){
            this.store.dispatch({type: HTTP_CALL, pl: { obj:uData, ext: pl.ext, method: 'post', jsonPath: pl.jsonPath, tgt: pl.tgt}});
          }
        };
        this.presentConfirm("Are you sure ?",fun);
      }else{
        this.store.dispatch({type: HTTP_CALL, pl: { obj:uData, ext: pl.ext, method: 'post', jsonPath: pl.jsonPath, tgt: pl.tgt}});
      }
    }
  }
  setAuthorization(): boolean{
    console.log('Setting authorization');

    let returnVal: boolean = false;
    this.state.take(1).map(state => state.user).subscribe(user => {
      if( user ){ this.headers.set("Authorization",user.claims.access_token); returnVal = true; }
    });
    return returnVal ;
  }
  getHeader(): Headers {
    console.log('Getting header...');
    return this.headers;
  }
  showLoader(){
    this.loading = this.ldgCtrl.create({content: 'Please wait...'});
    this.loading.present();//.then(a => { console.log('Done Loading: '+a); });
  }
  dismissLoader(){
    this.loading.dismissAll();
  }
  dispatch(action:Action){
    this.store.dispatch(action);
  }
  setEditMode(value: boolean){
    this.store.dispatch({type: SET_EDIT_MODE, pl: {editMode: value}})
  }
  flipEditMode(){
    this.state.take(1).subscribe(s => {
      this.store.dispatch({type: SET_EDIT_MODE, pl: {editMode: !s.editMode }})
    });
  }
  getQuiz(pl: QuizPayLType): LabelValueType[] | QuestionBase<string>[]{
    return this.questions.getQuizOrKeyVal(pl);
  }
  restoreUser(){
    this.userData.getUser().then(u => {
      if(u){
        console.log('Dispatching RESTORE_USER...');
        this.store.dispatch({type: RESTORE_USER, pl: {user: u}}); }
    });
  }
  mapPathId(path: JsonPath[],userId: number|undefined,aptId: Apt|undefined,roomId:number|undefined): JsonPath[]{
    let role: string = '';
    this.getStateObservable().take(1).subscribe(s => {if(s.user){ role = s.user.claims.role}});
    let newPath:any = [];

    path.forEach((obj) => {
      if( obj['key'] === 'users' ) {
        newPath.push({key:'users',id: userId})

        // if(userId) { newPath.push({key:'users',id: userId}) }
        // else{ newPath.push({key:'users',id:''}); }

      }
      else if ( obj['key'] === 'apts' ) {
        newPath.push({key:'apts',id: aptId});
        // if(aptId) { newPath.push({key:'apts',id: aptId}); }
        // else{ newPath.push({key:'apts',id:''}) }

      }
      else if ( obj['key'] === 'rooms' ){
        //First rename the key to either landlordRooms or tenantRooms based on role
        newPath.push({key: (role === landlordRole) ? 'landlordRooms':'tenantRooms', id: roomId });
      }else if(obj['key'] === 'landlordRooms'){

        newPath.push({key: 'landlordRooms', id: roomId });

      }else if(obj['key'] === 'tenantRooms'){

        newPath.push({key: 'tenantRooms', id: roomId });

      }else if(obj['key'] === 'bills' || obj['key'] === 'personList'){
        newPath.push(obj);
      }
      else{
        throw new Error('Found unrecognized key:'+obj['key']);
      }
    });
    console.log('Returning:'+JSON.stringify(newPath));
    return newPath;
  }
  display(tgt: string,obj: Apt|Room){
    let role:string = '';    this.getStateObservable().take(1).subscribe(s => { if(s.user){role = s.user.claims.role}});
    //This call will just get he label and value pairs for display purposes in the display details page
    let content = this.getQuiz({tgt:tgt,val:obj,fill:false,role:role});
    let mdl = this.mdlCtrl.create(DisplayPage, {content: content});
    mdl.present();
  }

  presentConfirm( msg: string, callback: (proceed:boolean) => any) {
    let alert = this.alertCtrl.create({
      title: msg,
      //message: msg,
      buttons: [
        {
          text: 'No',
          handler: () => {  callback(false); console.log('Cancel clicked'); }
        },
        {
          text: 'Yes',
          handler: () => { callback(true); console.log('Proceed clicked'); }
        }
      ]
    });
    alert.present().then(() => {});
    //callback(true);
  }


  //---------------------static functions------------------------------
  static validatePath(jsonPath: any[]){
    for(let i = 0; i < jsonPath.length - 1; i++){
      if(jsonPath[i]['id'] === '') throw new Error('Path index: '+i+' missing ids: '+JSON.stringify(jsonPath));
    }
  }

}
