import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomSummaryPage } from './room-summary';

@NgModule({
  declarations: [
    RoomSummaryPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomSummaryPage),
  ],
})
export class RoomSummaryPageModule {}
