import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { RoomsSummaryComponent } from './rooms-summary';

@NgModule({
  declarations: [
    RoomsSummaryComponent,
  ],
  imports: [
    IonicModule,
  ],
  exports: [
    RoomsSummaryComponent
  ]
})
export class RoomsSummaryComponentModule {}
