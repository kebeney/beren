import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {LabelValueType, QuizPayLType, QuizType, Room} from "../../interfaces/constants";
import {QuestionBase} from "./question-base";
import {IonGenericQuestion} from "./question-ion-generic";
import {DatePipe} from "@angular/common";

/*
  Generated class for the QuestionsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class QuestionsProvider {

  constructor(private datePipe: DatePipe){}

  /**
   *
   * @param {QuizPayLType} pl - Type of questions.
   * @returns {any[]} list of questions or prefilled questions or key - value labels
   */
  public getQuizOrKeyVal(pl: QuizPayLType): LabelValueType[] | QuestionBase<string>[]{
    let op = !(pl.val) ? 1: pl.fill ? 2 : 3 ;
    console.log('option:'+op);
    switch (pl.tgt) {
      case 'user': {
        return this.doGet(op,this.getUserQuiz(),pl.val);
      }
      case 'tenant': {
        return this.doGet(op,this.getTenantQuiz(),pl.val);
      }
      case 'room': {
        return this.doGet(op,this.roomQuiz,pl.val);
      }
      case 'payment':{
        return this.doGet(op,this.getOneTimePaymentQuiz(pl),pl.val);
      }
      case 'apt': {
        return this.doGet(op,this.getAptQuiz(pl),pl.val);
      }
      default:
        throw new Error('QuestionService: Unrecognized type: '+pl.tgt);
    }
  }
  private doGet(opt:number, quiz: QuizType[], val: object|undefined): LabelValueType[]{
    switch (opt){
      case 1: { return this.getQuizInstances(quiz)}
      case 2: { return this.getPreFilledQuiz(val,quiz);}
      case 3: { return this.getLabelValues(val,quiz); }
      default:
        throw new Error('QuestionService: Unrecognized option:'+opt);
    }
  }

  /**
   * @param valObj - json object containing the data to be displayedthis.questions
   * @param quiz - predefined json array of questions containing same fields as valObj
   * plus more, specifically label to be used with value field in valObj for display.
   * @returns {Array} - an array of label,value to display by caller component
   */
  private getLabelValues(valObj: any,quiz: QuizType[]): LabelValueType[]{
    let labelValues: LabelValueType[] = [];
    Object.keys(valObj).forEach(key => {
      let quizObj = quiz.find(obj => obj.key === key );
      if(typeof quizObj !== 'undefined'){
        labelValues.push({key: key ,label: quizObj['label'], value: valObj[key]}) ;
      }
    });
    return labelValues;
  }

  /**
   * This function creates instances of questions
   * @param quiz - predefined array of json objects representing the questions
   * @returns {QuestionBase<string>[]} - array containing instances of questions for dynamic display
   */
  private getQuizInstances(quiz: QuizType[]): QuestionBase<string>[]{
    let questions: QuestionBase<string>[] = [];
    quiz.forEach(q => {
      if (typeof q['ctrlType'] === 'string' && q['ctrlType'].trim() !== '' ){
        questions.push(new IonGenericQuestion(q));
      }else{
        throw new Error('Unsupported question type: '+q['type'] +' for '+q['label']);
      }
    });
    return questions.sort((a, b) => a.order - b.order);
  }
  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  public getPreFilledQuiz(valObj: any ,quiz: any[]): LabelValueType[]{
    let filledQuiz: QuizType[] = [];

    Object.keys(valObj).forEach(key => {
      let val = valObj[key];
      let quizObj = quiz.find(obj => obj.key === key );
      if(key === 'id') {
        filledQuiz.push({key: key, label: 'ID', value:valObj[key],required:false,order:1,ctrlType:'ion-text-box', hidden: true});
      }
      if(typeof quizObj !== 'undefined'){
        if(typeof quizObj['ctrlType'] !== 'undefined' && quizObj['ctrlType'].toUpperCase().includes('DATE')){
          quizObj['value'] = this.datePipe.transform(val,'yyyy-MM-ddTHH:mm:ss');
        }else{
          quizObj['value'] = val;
        }
        filledQuiz.push(quizObj) ;
      }
    });
    //Invoke getQuizInstances and return them
    return this.getQuizInstances(filledQuiz);
  }

  //-----------------------Quiz---------------------------------------------------------------------

  private getAptQuiz(pl:QuizPayLType): QuizType[]{
    if(pl.role == 'tenant' && pl.options){
      let aptQuiz: any = [];
      let options: Array<any> = [];
      pl.options.forEach((r:Room) => {options.push({key:r.id,value:r.name})});
      aptQuiz.push( {
        key: 'id',
        label: 'Select Hse/Room/Unit',
        order: 1,
        ctrlType: 'ion-drop-down',
        options: options,
      });
      return aptQuiz;
    }else{
      return this.aptQuiz;
    }
  }
  private getUserQuiz(): QuizType[]{
    let userQuiz: any = [];
    userQuiz.push( {
      key: 'role',
      label: 'Role',
      order: 1,
      ctrlType: 'ion-drop-down',
      options: [{key: 'tenant', value: 'Tenant'},{key: 'landlord',value: 'Property Owner'}],
    });
    userQuiz.push( {
      key: 'username',
      label: 'User Name',
      order: 2,
      ctrlType: 'ion-text-box'
    });
    userQuiz.push( {
      key: 'password',
      label: 'Password',
      order: 3,
      type: 'password',
      ctrlType: 'ion-text-box'
    });
    this.personQuiz.forEach( pq => {userQuiz.push(pq)});
    return userQuiz;
  }
  private getTenantQuiz(): QuizType[]{
    let tenantQuiz: any = [];
    tenantQuiz.push({
      key: 'leaseStart',
      label: 'Lease Start Date',
      displayFormat: 'DD-MMM-YYYY',
      pickerFormat: 'DD-MMM-YYYY',
      order: 2,
      ctrlType: 'ion-date',
      value: this.getZonedDate(),
      max: this.getZonedDate()
    });
    tenantQuiz.push({
      key: 'prorate',
      label: 'Prorate Rent for First Month',
      order: 3,
      type: 'checkbox',
      value: 'false',
      ctrlType: 'checkbox'
    });
    this.personQuiz.forEach( pq => {tenantQuiz.push(pq)});
    return tenantQuiz;
  };
  private getOneTimePaymentQuiz(pl: QuizPayLType): QuizType[]{
    let tmpOnePaymentQuiz: any = [];
    //If role is landlord/caretaker
    if(pl.role === 'landlord'){
      tmpOnePaymentQuiz.push(
        {
          key: 'rcpt',
          label: 'Receipt Number',
          order: 3,
          ctrlType: 'ion-text-box'
        }
      );
    }else if(pl.role !== 'tenant'){
      //We skip the tenant role because it is known but we don't add any more questions for tenant.
      throw new Error('Unrecognized role:'+pl.role);
    }

    this.oneTimePaymentQuiz.forEach(q => {
      tmpOnePaymentQuiz.push(q);
    });
    return tmpOnePaymentQuiz;
  }
  private roomQuiz = [
    {
      key: 'name',
      label: 'Room Name',
      order: 1,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'rent',
      label: 'Monthly Rent',
      order: 2,
      ctrlType: 'ion-text-box'
    }
  ];
  // private accountPaymentBankQuiz = [
  //   {
  //     key: 'bankName',
  //     label: 'Bank Name',
  //     order: 1,
  //     ctrlType: 'ion-text-box'
  //   },
  //   {
  //     key: 'accountName',
  //     label: 'Account Name',
  //     order: 2,
  //     ctrlType: 'ion-text-box'
  //   },
  //   {
  //     key: 'accountNumber',
  //     label: 'Account Number',
  //     order: 3,
  //     ctrlType: 'ion-text-box'
  //   },
  //   {
  //     key: 'phoneNumber',
  //     label: 'Associated Phone Number',
  //     order: 4,
  //     ctrlType: 'ion-text-box'
  //   }
  // ];
  private personQuiz = [
    {
      key: 'firstName',
      label: 'First Name',
      order: 4,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'lastName',
      label: 'Last Name',
      order: 5,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'email',
      label: 'Email Address',
      order: 6,
      type: 'email',
      ctrlType: 'ion-text-box'
    },
    {
      key: 'phoneNo',
      label: 'Phone number',
      order: 7,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'emcp',
      label: 'Emergency Contact Phone',
      order: 8,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'street',
      label: 'Home Street or (Known Family Name)',
      order: 9,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'city',
      label: 'Home City or Town or Village',
      order: 10,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'postcode',
      label: 'Postal Code',
      order: 11,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'country',
      label: 'Country',
      order: 12,
      ctrlType: 'ion-text-box'
    }
  ];
  //TODO: disable or enable payment Date based on wether role is landlord or tenant.
  private oneTimePaymentQuiz = [
    {
      key: 'pmtDtEpochMilli',
      label: 'Date',
      displayFormat: 'DD MMM YYYY',
      pickerFormat: 'DD MMM YYYY',
      order: 1,
      ctrlType: 'ion-date',
      value: this.getZonedDate()
    },
    {
      key: 'amt',
      label: 'Amount',
      order: 2,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'description',
      label: 'Description',
      order: 5,
      ctrlType: 'ion-text-box'
    }
  ];
  private aptQuiz = [
    {
      key: 'name',
      label: 'Building Name',
      required: true,
      order: 1,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'street',
      label: 'Street or Business Name',
      required: true,
      order: 2,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'city',
      label: 'Town or City',
      required: true,
      order: 3,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'county',
      label: 'County of Building Location',
      required: true,
      order: 4,
      ctrlType: 'ion-text-box'
    },
    {
      key: 'country',
      label: 'Country',
      order: 5,
      ctrlType: 'ion-text-box'
    }
  ];

  private getZonedDate(): string {
    let date  = new Date();
    let tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num: number) {
        let norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
      };
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);
  }

}
