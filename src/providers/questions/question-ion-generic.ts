import { QuestionBase } from './question-base';

export class IonGenericQuestion extends QuestionBase<string> {
  //TODO: change the default to ion-text-box. That is a majority of the questions
  controlType = '';
  type: string;

  constructor(options: any = {}) {
    super(options);
    this.type = options['type'] || '';
    if( typeof options['ctrlType'] !== 'string' || options['ctrlType'].trim() === ''){
      throw new Error('Please provide "ctrlType" for generic question');
    }else{
      this.controlType = options['ctrlType'];
    }
  }
}
