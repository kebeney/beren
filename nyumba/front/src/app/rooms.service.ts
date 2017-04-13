import { Injectable } from '@angular/core';
import {Http, Headers, Response} from "@angular/http";

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Room} from "./room";
import {PaymentDetails} from "./payment-details";


@Injectable()
export class RoomService {
  private basesUrl = 'http://localhost:9000';
  private headers = new Headers({'Content-type': 'application/json'});

//  private heroesUrl = 'api/heroes';  // URL to web api
//  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private  http: Http) {
  }

  update(body: string, ext: string): Promise<any> {
    return this.http.post(this.basesUrl + ext, body, {headers: this.headers}).toPromise();
  }
  getRooms(){
    return this.http.get(this.basesUrl+"/getRooms").toPromise().then(res => res.json() as Room[]);
  }
  getRoomDetails1(roomId: number): void {

  }
  getRoomDetails(id: number): Promise<PaymentDetails[]> {
//    var res:Response ; res.
    const url = `${this.basesUrl}/roomDetails/${id}`;
    return this.http.get(url).toPromise().then(response => response.json().data as PaymentDetails[]);
  }
}
