import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output}  from '@angular/core';
import { FormGroup }                 from '@angular/forms';
import { QuestionBase }              from './question-base';
import { QuestionControlService }    from './question-control.service';
@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [ QuestionControlService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnInit {
  @Input() questions: QuestionBase<any>[] = [];
  @Input() state: any;
  @Output() formOutput = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() changes = new EventEmitter();
  form: FormGroup;
  constructor(private qcs: QuestionControlService) {  }
  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.questions);
  }
}
