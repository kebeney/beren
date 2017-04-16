import { Injectable } from '@angular/core';
import {Http, Headers, Response} from "@angular/http";

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Room} from "./room";
import {PaymentDetails} from "./payment-details";
import {ComponentStateService} from "./component-state.service";


@Injectable()
export class ErenHttpService <T>{
  private basesUrl = 'http://localhost:9000';
  private headers = new Headers({'Content-type': 'application/json'});

  constructor(private  http: Http) {
  }
  update(body: string, ext: string): Promise<T[]> {
    return this.http.post(this.basesUrl + ext, body, {headers: this.headers}).toPromise().then(res => res.json() as T[]);
  }
  getRecords(endPoint: string): Promise<T[]> {
    return this.http.get(this.basesUrl+endPoint).toPromise().then(res => res.json() as T[]);
  }
  getRoomDetails1(roomId: number): void {

  }
  getRoomDetails(id: number): Promise<PaymentDetails[]> {
//    var res:Response ; res.
    const url = `${this.basesUrl}/roomDetails/${id}`;
    return this.http.get(url).toPromise().then(response => response.json().data as PaymentDetails[]);
  }
}
