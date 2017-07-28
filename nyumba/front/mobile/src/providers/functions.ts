import {HTTP_CALL, QuizPayLType, RESET_MESSAGE, State} from "../interfaces/consts";
import {Store} from "@ngrx/store";
import {Injectable} from "@angular/core";
import {AlertController, Events, Loading, LoadingController} from "ionic-angular";
import {Subject} from "rxjs/Subject";
import {QuestionsProvider} from "./questions/questions";
import {UserData} from "./user-data";
import {Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class FunctionsProvider{

  private headers = new Headers({'Content-type': 'application/json'});
//  public user: Person;
  public editMode = false;
  private loading: Loading;
  public navOptionsBack =    {animate: true, animation: 'ios-transition',duration: 300, direction: 'back',    easing: 'ease-out' };
  public navOptionsForward = {animate: true, animation: 'ios-transition',duration: 300, direction: 'forward', easing: 'ease-out' };
  private msgSubs: Subject<void> = new Subject<void>();
  private showing: boolean = false;
  private state: Observable<State> ;

  constructor(private store: Store<State>, private questions: QuestionsProvider, private ldgCtrl: LoadingController,
              private altCtrl: AlertController, private usrData: UserData, private events: Events){
    this.state = store.select('componentReducer');

    this.state.takeUntil(this.msgSubs).subscribe( (s: State): void => {
      if(s.message !== null){
        if(s.message == 'tokenExp'){
          //Do not invoke events.publish('user:logout') here. It already gets invoked by below statement.
          this.usrData.logout();
        }else if(!this.showing){
          this.showing = true;
          //Present message and wait for user to click ok.
          this.altCtrl.create({title: '', message: s['message'], buttons: [{text: 'Dismiss',handler: () => {
            this.showing = false;
            this.store.dispatch({type: RESET_MESSAGE})
          }}]}).present();
        }
      }
    });
  }
//           ext,  parentId, data,     model, jsonPath
//Example: '/add','apt.id', '$event', 'Room','[user,apt,room]'
  formOutput(ext: string, parentId: string, data: any, model: string ,jsonPath: any [], args?: any){
        //console.log(ext,parentId,data,model,jsonPath);
    //jsonPath = typeof jsonPath === 'undefined' ? [] : jsonPath;
    this.validatePath(jsonPath);
    if(typeof args == 'undefined') args = {};

    if(model === 'Payment') {  let date = new Date(data['pmtDtEpochMilli']);  data['pmtDtEpochMilli'] = date.getTime(); }

    data['parentId'] = parentId;
    let uData = {'type': model, 'data': data};
    this.setAuthorization().then((r:boolean) => {
      if(r || ext.endsWith('login') || ext.endsWith('signup')){
        this.store.dispatch({type: HTTP_CALL, payload: { data:uData, ext: ext, method: 'post', jsonPath: jsonPath, tgt: args.tgt || ''}});
      }
      else{ this.events.publish("user:logout"); }
    });
  }
  httpGet(ext: string, jsonPath: any[], target:string){
    this.validatePath(jsonPath);
    this.setAuthorization().then((r:boolean) => {
      if(r){ this.store.dispatch({type: HTTP_CALL, payload: { data:'', method: 'get', ext:ext, jsonPath: jsonPath, tgt: target }}) }
      else {this.events.publish("user:logout");}
    })
  }
  setAuthorization(): Promise<boolean>{
    let user:any = null;
    this.state.take(1).subscribe(s => {
      user = s['users'][0];
      typeof user !== 'undefined' && this.headers.set("Authorization",user.claims.access_token);
    });
    if(user == null){
      return Promise.resolve(false);
    }else{
      return Promise.resolve(true);
    }
//    this.state.take(1).subscribe(s => {
//      let user = s['users'][0];
//       if(user == null || user.length != 1){
//         return this.usrData.getUser().then(u => {
//           if(typeof u != 'undefined' && u != null && typeof u.claims != 'undefined'){
//             this.headers.set("Authorization",user.claims.access_token);
//             return Promise.resolve(true);
//           }
//           else {
//             return Promise.resolve(false);
//           }
//         });
//       }else {
//         this.headers.set("Authorization",user.claims.access_token);
//         return Promise.resolve(true);
//       }
 //   });
  }
  getHeader(): Headers {
    return this.headers;
  }
  //target is the object eg, room, apt, etc. valObj is the object, fill is whether to prefill the values or not.
  getQuiz(pl: QuizPayLType): any[]{
    return this.questions.getQuizOrKeyVal(pl);
  }
  mapPathId(path: any[],user: any,apt: any,room:any): any{
    path.forEach(p => {
      if ( p['key'] === 'users' && user != null ) {p['id'] = user.id}
      else if ( p['key'] === 'apts'  && apt  != null)  {p['id'] =  apt.id}
      else if ( p['key'] === 'rooms' && room != null)  {p['id'] = room.id}
    });
    return path;
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
  // hasRole(role:string){
  //   let result = false;
  //   this.state.takeLast(1).subscribe(s => {
  //     let user = s['users'][0];
  //     if(user.claims.role == '')
  //   });
  //   if(this.user != undefined && this.user.claims.roles.includes(role)){
  //     return true;
  //   }else{
  //     return false;
  //   }
  // }
}
