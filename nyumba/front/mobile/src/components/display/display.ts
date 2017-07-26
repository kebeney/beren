import { Component } from '@angular/core';
import {NavParams, ViewController} from "ionic-angular";
@Component({
  selector: 'display',
  templateUrl: 'display.html'
})
export class Display {
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
