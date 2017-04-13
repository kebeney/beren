import {Component, Inject, OnInit} from '@angular/core';


import {animate, state, style, transition, trigger} from '@angular/animations';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { PaymentDetails } from './payment-details';
import { RoomService } from './rooms.service';
import {ActivatedRoute, Params} from "@angular/router";
import {ComponentStateService} from "./component-state.service";

@Component({
	moduleId: module.id,
	selector: 'roomDetail',
	templateUrl: 'room-details.component.html',
  styleUrls: ['rooms.component.css'],
  animations: [trigger(
    'openClose',
    [
      state('collapsed, void', style({height: '0px', color: 'maroon', borderColor: 'maroon'})),
      state('expanded', style({height: '*', borderColor: 'green', color: 'green'})),
      transition(
        'collapsed <=> expanded', [animate(500, style({height: '250px'})), animate(500)])
    ])]
})

export class RoomDetailComponent{

  state : ComponentStateService = new ComponentStateService();
  roomName: string = ""; roomNum: number = 0;  rent: string = "" ;

  constructor(private roomService: RoomService, private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {this.roomName = params['roomName']; this.roomNum = params['roomNum']; this.rent = params['rent'] });
    this.state.componentName = "Payment"; this.state.activeAddButtonText = this.state.addText+" "+this.state.componentName;
    this.state.component = {roomName: this.roomName, roomNum: this.roomNum ,month: "Jan", rent: "Ksh 8000", amount: "", balance: "", totalPaid: "", paymentDate: "", receiptNumber: "" } ;
  }
	addPayment(done: boolean): void {
    this.state.update(done,{roomName: this.roomName, roomNum: this.roomNum, month: "Jan", rent: "Ksh 8000", amount: "", balance: "", totalPaid: "", paymentDate: "", receiptNumber: "" });
    if(done)this.savePayments();
	}
	savePayments(){
    this.state.serverMessage = "Loading Content..."
    this.roomService.update(this.state.get_components_as_string(),"/updateRoomDetails")
      .then(message => {this.state.serverMessage = message.get()})
      .catch(res => { this.state.serverMessage = res.status +":"+res.statusText });


  }
  getPaymentDetails(): void {

  }


}
