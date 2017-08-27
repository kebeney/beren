import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {Toast, ToastController} from "ionic-angular";

/**
 *
*/
@Injectable()
export class ToastProvider {

  private msgList: Array<string> = [];
  private showing: boolean = false;
  private currMsg: string;

  constructor(private toastCtrl: ToastController) {}

  public showMsg(msg: string){

  this.currMsg !== msg && this.msgList.unshift(msg);
  this.display();

  }
  private display(){
    if(!this.showing && this.msgList.length > 0){
      let msg: string | undefined = this.msgList.pop();
      if(msg) { this.showing = true; this.currMsg = msg; this.present(msg) }
    }
  }
  private present (msg: string){
    let toast: Toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Dismiss'
      //dismissOnPageChange: true,
      //cssClass: 'primary'
    });
    toast.onDidDismiss(() => {
      this.showing = false;
      this.currMsg = '';
      this.display();
    });
    toast.present();
  }
}
