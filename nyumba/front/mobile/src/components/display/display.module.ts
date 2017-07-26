import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Display } from './display';

@NgModule({
  declarations: [
    Display,
  ],
  imports: [
    IonicPageModule.forChild(Display),
  ],
  exports: [
    Display
  ]
})
export class DisplayModule {}
