import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuestionView } from './question-view';

@NgModule({
  declarations: [
    QuestionView,
  ],
  imports: [
    IonicPageModule.forChild(QuestionView),
  ],
  exports: [
    QuestionView
  ]
})
export class QuestionViewModule {}
