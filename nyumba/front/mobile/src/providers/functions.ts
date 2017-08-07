import {HTTP_CALL, landlordRole, QuizPayLType, SET_EDIT_MODE, State} from "../interfaces/consts";
import {Store} from "@ngrx/store";
import {Injectable} from "@angular/core";
import {AlertController, Events, Loading, LoadingController} from "ionic-angular";
import {Subject} from "rxjs/Subject";
import {QuestionsProvider} from "./questions/questions";
import {Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class FunctionsProvider{

  private headers = new Headers({'Content-type': 'application/json'});
//  public user: Person;
  public editMode: Observable<boolean>;
  //public editModeSub: Subject<boolean> = new Subject();
  private loading: Loading;
  public navOptionsBack =    {animate: true, animation: 'ios-transition',duration: 300, direction: 'back',    easing: 'ease-out' };
  public navOptionsForward = {animate: true, animation: 'ios-transition',duration: 300, direction: 'forward', easing: 'ease-out' };
  private msgSubs: Subject<void> = new Subject<void>();
  private state: Observable<State> ;

  constructor(private store: Store<State>, private questions: QuestionsProvider, private ldgCtrl: LoadingController,
              private altCtrl: AlertController, private events: Events){
    this.state = store.select('componentReducer');
    this.editMode = new Observable(observer => {
      this.state.subscribe(s => {
        observer.next(s.editMode);
      });
    });
  }
//           ext,  parentId, data,     model, jsonPath
//Example: '/add','apt.id', '$event', 'Room','[user,apt,room]'
  formOutput(ext: string, parentId: string, data: any, model: string ,jsonPath: any [], args?: any){
        //console.log(ext,parentId,data,model,jsonPath);

    this.validatePath(jsonPath);
    if(typeof args == 'undefined') args = {};

    if(model === 'Payment') {  let date = new Date(data['pmtDtEpochMilli']);  data['pmtDtEpochMilli'] = date.getTime(); }

    data['parentId'] = parentId;
    let uData = {'type': model, 'data': data};
    this.setAuthorization().then((authorized:boolean) => {
      if( authorized || ext.endsWith('login') || ext.endsWith('signup')){
        console.log('Dispatching HTTP_CALL');
        this.store.dispatch({type: HTTP_CALL, payload: { data:uData, ext: ext, method: 'post', jsonPath: jsonPath, tgt: args.tgt || ''}});
      }
    });
  }

  httpGet(ext: string, jsonPath: any[], target:string){
    this.validatePath(jsonPath);
    this.setAuthorization().then((authorized:boolean) => {
      if(authorized){ this.store.dispatch({type: HTTP_CALL, payload: { data:'', method: 'get', ext:ext, jsonPath: jsonPath, tgt: target }}) }
      else {this.events.publish("user:logout");}
    })
  }
  setEditMode(value: boolean){
    this.store.dispatch({type: SET_EDIT_MODE, payload: {editMode: value}})
  }
  flipEditMode(){
    this.state.take(1).subscribe(s => {
      this.store.dispatch({type: SET_EDIT_MODE, payload: {editMode: !s.editMode }})
    });
  }
  getEditMode(): boolean {
    let editMode: boolean= false;
    this.state.take(1).subscribe(s => {
      editMode = s.editMode;
    });
    return editMode;
  }
  getRole(): string{
    let role: string = '';
    this.state.take(1).subscribe(s => {
      let user = s.users[0];
      if(user && user.claims){
        role = user.claims.role
      }
    });
    return role;
  }
  setAuthorization(): Promise<boolean>{
    console.log('Setting authorization');
    let user:any = null;
    let returnVal: boolean = false;
    this.state.take(1).subscribe(s => {
      user = s['users'][0];
      if(user !== null && typeof user !== 'undefined' && (typeof user.claims !== 'undefined')){
        this.headers.set("Authorization",user.claims.access_token);
        returnVal = true;
      }
    });
    return Promise.resolve(returnVal);
  }
  getHeader(): Headers {
    console.log('Getting header...');
    return this.headers;
  }
  //target is the object eg, room, apt, etc. valObj is the object, fill is whether to prefill the values or not.
  getQuiz(pl: QuizPayLType): any[]{
    return this.questions.getQuizOrKeyVal(pl);
  }
  //mapPathId(path: any[],user: Person,apt: Apt,room:Room): any{
  mapPathId(path: any[],user: any,apt: any,room:any): any{

    let role = this.getRole();
    let newPath:any = [];

    path.forEach((obj) => {
      if( obj['key'] === 'users' ) {
        if(user !== null) {
         newPath.push({key:'users',id: user.id})
        }else{
          newPath.push({key:'users',id:''});
        }
      }
      else if ( obj['key'] === 'apts' ) {
        if(apt  !== null) {
          newPath.push({key:'apts',id: apt.id});
        }else{
          newPath.push({key:'apts',id:''})
        }
      }
      else if ( obj['key'] === 'rooms' ){
        //First rename the key to either landlordRooms or tenantRooms based on role
        newPath.push({key: (role === landlordRole) ? 'landlordRooms':'tenantRooms', id: (room !== null)? room.id:'' });
      }else if(obj['key'] === 'landlordRooms'){

        newPath.push({key: 'landlordRooms', id: (room !== null)? room.id:'' });

      }else if(obj['key'] === 'tenantRooms'){

        newPath.push({key: 'tenantRooms', id: (room !== null)? room.id:'' });

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
  showLoader(){
    this.loading = this.ldgCtrl.create({content: 'Please wait...'});
    this.loading.present();
  }
  dismissLoader(){
    this.loading.dismissAll();
  }
  validatePath(jsonPath: any[]){
    for(let i = 0; i < jsonPath.length - 1; i++){
      if(jsonPath[i]['id'] === '') throw new Error('Path index: '+i+' missing ids: '+JSON.stringify(jsonPath));
    }
  }
  complete(){
    this.msgSubs.next();
    this.msgSubs.complete();
  }

  presentConfirm(title: string, message: string, yesHandler: any, noHandler: any): Promise<void> {
    let alert = this.altCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: noHandler
        },
        {
          text: 'Proceed?',
          handler: yesHandler
        }
      ]
    });
    return alert.present().then(res => { console.log(res)});
  }

  findObj(theObject: any, id: any, propToFind: string){
    return this.getObject(theObject,id, '',propToFind);
  }

  getObject(theObject: any, id: any, lastProp: string, propToFind: string): any {
  var result = null;
    if(theObject instanceof Array) {
      for(var i = 0; i < theObject.length; i++) {
        result = this.getObject(theObject[i], id, lastProp, propToFind);
        if (result) {
          break;
        }
      }
    }
    else
    {
      for(var prop in theObject) {
        //console.log(prop + ': ' + theObject[prop]);
        if(prop == 'id') {
          if(theObject[prop] == id && lastProp === propToFind) {
            return theObject;
          }
        }
        if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
          //this.lastProp = prop;  let localProp: string = prop;
          result = this.getObject(theObject[prop], id, prop, propToFind);
          //this.lastProp = localProp;
          if (result) {
            break;
          }
        }
      }
    }
    return result;
  }
}
