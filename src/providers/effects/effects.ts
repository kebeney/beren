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
import {FunctionsProvider} from "../functions/functions";
import {Action, HTTP_CALL, HTTP_FAILED, HTTP_SUCCESS} from "../../interfaces/constants";
import {ConfigsProvider} from "../configs/configs";

@Injectable()
export class EffectsProvider {
  private knownCode: any =
    {0: 'Unreachable: Check your internet connection or try later',404: 'Server Error: Not Found'};

  constructor( private http: Http, private actions$: Actions, private fns: FunctionsProvider, private config: ConfigsProvider) {
    this.actions$.observeOn(async);
  }

  @Effect() fetch$ = this.actions$
    .ofType(HTTP_CALL)
    .switchMap((action:Action) => {

      let body = JSON.stringify(action.pl.obj) ;
      let call: Observable<any> ;

      if(action.pl.method === 'post'){

        if(!body){ console.debug('POST method needs to have body'); }

        let url = this.config.base_url +''+ action.pl.ext +''+ (action.pl.id?action.pl.id:'');
        call = this.http.post(url,body,{headers: this.fns.getHeader()});

      }else if (action.pl.method === 'get') {

        call = this.http.get(this.config.base_url +'/'+ action.pl.ext , {headers: this.fns.getHeader()});

      }else{
        return Observable.of({ type: HTTP_FAILED, pl: { data: { msg: 'Invalid http method:'+action.pl.method }, tgt: action.pl.tgt}})
      }

      this.fns.showLoader();

      let result: Observable<any> =  call.switchMap(res => {

        this.fns.dismissLoader();
        let data = res.json();
        //if(data.msg && data.msg == 'deleted'){data['obj'] = {id:data.id} }
        console.log(data);
        return Observable.of({ type: HTTP_SUCCESS, pl: { obj: data.obj, jsonPath: action.pl.jsonPath , tgt: action.pl.tgt, msg: data.msg} })

      }).catch((error) => {

        this.fns.dismissLoader();

        console.log(error);

        //let msg = error._body ? error._body : this.knownCode[error.status] ? this.knownCode[error.status] : 'Unknown Error, Please try later!';
        let msg  = this.knownCode[error.status] ? this.knownCode[error.status] : error._body  ? error._body : 'Unknown Error Please try later!';

        return Observable.of({ type: HTTP_FAILED, pl: { msg: msg} }) }

      );
      return result;
    });
}
