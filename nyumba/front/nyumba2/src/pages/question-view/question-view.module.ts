import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuestionViewPage } from './question-view';

@NgModule({
  declarations: [
    QuestionViewPage,
  ],
  imports: [
    IonicPageModule.forChild(QuestionViewPage),
  ],
})
export class QuestionViewPageModule {}
