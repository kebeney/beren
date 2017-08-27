import { Component } from '@angular/core';
import {IonicPage, NavParams, ViewController} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-display',
  templateUrl: 'display.html',
})
export class DisplayPage {

  content: Array<{label: any, value: any}>;
  title: string = 'Details';

  constructor(private navParams: NavParams, private viewCtrl: ViewController) {}
  ionViewDidLoad() {
    this.content = this.navParams.get('content');
  }
  closeModal(){
    this.viewCtrl.dismiss();
  }
}


