import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomsPage } from './rooms';

@NgModule({
  declarations: [
    RoomsPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomsPage),
  ],
  exports: [
    RoomsPage
  ]
})
export class RoomsPageModule {}
