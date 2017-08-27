import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AptsPage } from './apts';

@NgModule({
  declarations: [
    AptsPage,
  ],
  imports: [
    IonicPageModule.forChild(AptsPage),
  ],
})
export class AptsPageModule {}
