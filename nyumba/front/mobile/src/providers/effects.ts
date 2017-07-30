import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {Actions, Effect} from '@ngrx/effects';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import {async} from "rxjs/scheduler/async";
import 'rxjs/add/operator/observeOn';
import 'rxjs/Rx';
import {Config} from "./config";
import {FunctionsProvider} from "./functions";
import {HTTP_CALL, HTTP_FAILED, HTTP_SUCCESS} from "../interfaces/consts";
//import {Events} from "ionic-angular";

@Injectable()
export class MainEffects {

    constructor( private http: Http, private actions$: Actions, private fns: FunctionsProvider, private config: Config) {
        this.actions$.observeOn(async);
    }

  @Effect() fetch$ = this.actions$
    .ofType(HTTP_CALL)
    .switchMap((action:any) => {

      let body = JSON.stringify(action.payload.data) ;
      let call: Observable<any> ;

      if(action.payload.method === 'post'){

        let url = this.config.base_url +''+ action.payload.ext +''+ (action.payload.id === undefined ? '' : action.payload.id);
        call = this.http.post(url,body,{headers: this.fns.getHeader()});

      }else if (action.payload.method === 'get') {

        call = this.http.get(this.config.base_url +'/'+ action.payload.ext , {headers: this.fns.getHeader()});

      }else{
        return Observable.of({ type: HTTP_FAILED, payload: { data: { msg: 'Invalid http method:'+action.payload.method }, tgt: action.payload.tgt}})
      }

      this.fns.showLoader();

      let result: Observable<any> =  call.switchMap(res => {

        this.fns.dismissLoader();
        let tData = res.json();
        return Observable.of({ type: HTTP_SUCCESS, payload: { data: tData.data, jsonPath: action.payload.jsonPath , tgt: action.payload.tgt, msg: tData.msg} })

      }).catch((error) => {

        this.fns.dismissLoader();

        let data = error.status == 0 ? {msg: 'Server Unavailable. Please try later!'} : JSON.parse(error._body );
        //return Observable.of({ type: SAVE_TO_BACKEND_FAILED, payload: { data: JSON.parse(error._body), jsonPath: action.payload.jsonPath }}) }
        return Observable.of({ type: HTTP_FAILED, payload: { data: data, jsonPath: action.payload.jsonPath , tgt: action.payload.tgt} }) }

      );
      return result;
    });
//     @Effect() login$ = this.actions$.ofType(HTTP_SUCCESS)
//       .switchMap((action: any) => {
//       //let data = action.payload.data;
// //TODO: Start from here. Figure out how to control navigation and set root to TabsPage after successful login
//         this.events.publish('user:login');
//       console.log('Action is: '+JSON.stringify(action.payload.data.kip));
//       return Observable.of();
//       })
}
