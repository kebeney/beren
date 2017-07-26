import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GenericView } from './generic-view';

@NgModule({
  declarations: [
    GenericView,
  ],
  imports: [
    IonicPageModule.forChild(GenericView),
  ],
  exports: [
    GenericView
  ]
})
export class GenericViewModule {}
