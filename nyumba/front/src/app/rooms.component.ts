import {Component, OnInit} from '@angular/core';
import { Room } from './room';
import { RoomService } from './rooms.service';

@Component({
	moduleId: module.id,
	selector: 'room',
	templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.css']
})

export class RoomComponent{

  constructor(private roomService: RoomService ){}

  rooms: Room[] = []; newRooms: Room[] = []
  room: Room
  activeButtonText = "Add Room";
  public editing = false;

  ngOnInit(){
    this.getRooms();
  }


	addRoom(done: boolean): void {
	  if(!this.editing){
	    this.room  = {num: this.rooms.length+1, name: "", rent: "", status: "New" ,occupant: "Empty"} ;
	    this.editing = true;
      this.activeButtonText = "Add";
    }else if(done){
      this.rooms.push(this.room); this.newRooms.push(this.room); var room: Room ; this.room = room;
	    this.editing = false;
      this.activeButtonText = "Add Room";
      this.saveRooms();
    }
    else {
      var lroom = {num: this.rooms.length+2, name: "", rent: "", status: "New", occupant: "Empty"};
      this.rooms.push(this.room); this.newRooms.push(this.room) ; this.room = lroom;
      this.editing = true;
    }
	}
	saveRooms(): void {
    this.roomService.update("["+this.newRooms.map(function (e) {  return JSON.stringify(e, null, "  "); }).join(",")+"]","/updateRooms").then(()=> { this.newRooms = [] ; this.getRooms()});
  }
  getRooms(): void {
	  this.roomService.getRooms().then(roomList => { console.log(roomList) ; this.rooms = roomList});
  }
}
