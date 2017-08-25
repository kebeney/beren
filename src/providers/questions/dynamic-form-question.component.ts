import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup }        from '@angular/forms';
import { QuestionBase }     from './question-base';

@Component({
  selector: 'df-question',
  templateUrl: './dynamic-form-question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormQuestionComponent {
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  @Output() changes = new EventEmitter();
  @Input() state: any;
  get isValid() {
    return this.form.controls[this.question.key].valid;
  }
  get isTouched(){
    return this.form.controls[this.question.key].touched;
  }
  get isDirty(){
    return this.form.controls[this.question.key].dirty;
  }
}
