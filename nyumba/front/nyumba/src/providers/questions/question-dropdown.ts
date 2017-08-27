import { QuestionBase } from './question-base';

export class DropdownQuestion extends QuestionBase<string> {
  controlType = 'ion-drop-down';
  options: {key: string, value: string}[] = [];

  constructor(options: any = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}
