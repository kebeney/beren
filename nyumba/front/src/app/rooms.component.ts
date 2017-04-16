import {Component, OnInit} from '@angular/core';
import { Room } from './room';
import { ErenHttpService } from './eren-http.service';
import {ComponentStateService} from "./component-state.service";

@Component({
	moduleId: module.id,
	selector: 'room',
	templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.css']
})

export class RoomComponent{

  state: ComponentStateService<Room> = new ComponentStateService<Room>();
  constructor(private roomService: ErenHttpService<Room> ){}

  ngOnInit(){
    this.state.serverMessage = "Loading..."
    this.state.componentName = "Room"; this.state.activeAddButtonText = this.state.addText+" "+this.state.componentName;
    this.state.getExistingRecords(this.roomService,"/getRooms");
    this.state.component = {num: this.state.componentArray.length, name: "", rent: "", status: "New" ,occupant: "Empty"} ;
  }

  addRoom(done: boolean): void {
    this.state.update(done, {num: this.state.componentArray.length, name: "", rent: "", status: "New" ,occupant: "Empty"});
    this.state.component.num = this.state.componentArray.length+1;
    if(done)this.saveRooms();
  }
	saveRooms(): void {
      this.state.savePost(this.roomService,"/updateRooms");
  }
}
