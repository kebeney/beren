import {Component, Inject, OnInit} from '@angular/core';
//import { PolymerElement } from '@vaadin/angular2-polymer';


import {animate, state, style, transition, trigger} from '@angular/animations';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { PaymentDetails } from './payment-details';
import { ErenHttpService } from './eren-http.service';
import {ActivatedRoute, Params} from "@angular/router";
import {ComponentStateService} from "./component-state.service";

@Component({
	moduleId: module.id,
	selector: 'roomDetail',
	templateUrl: 'room-details.component.html',
  styleUrls: ['rooms.component.css']
})

export class RoomDetailComponent{

  state : ComponentStateService<PaymentDetails> = new ComponentStateService<PaymentDetails>();
  roomName: string = ""; roomNum: number = 0;  rent: string = "" ; roomId: number

  constructor(private roomService: ErenHttpService<PaymentDetails>, private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {this.roomName = params['roomName']; this.roomNum = params['roomNum']; this.rent = params['rent']; this.roomId = params['roomId'] });
    this.state.componentName = "Payment"; this.state.activeAddButtonText = this.state.addText+" "+this.state.componentName;
    this.state.component = {roomName: this.roomName, roomId: this.roomId, roomNum: this.roomNum ,month: "Jan", rent: "Ksh 8000", amount: "", balance: "", totalPaid: "", paymentDate: "", receiptNumber: "" } ;
    this.state.getExistingRecords(this.roomService,"/roomDetails/"+this.roomId)
  }
	addPayment(done: boolean): void {
    this.state.update(done,{roomName: this.roomName, roomId: this.roomId, roomNum: this.roomNum, month: "Jan", rent: "Ksh 8000", amount: "", balance: "", totalPaid: "", paymentDate: "", receiptNumber: "" });
    if(done)this.savePayments();
	}
	savePayments(){
    this.state.serverMessage = "Loading Content..."
    this.state.savePost(this.roomService,"/updateRoomDetails")
  }

}
