import {Injectable, Injector} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Facebook} from "@ionic-native/facebook";
import {GooglePlus} from "@ionic-native/google-plus";

/*
  Generated class for the Oauth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class Oauth {

//  private oauthTokenKey = 'oauthToken';
  private injector: Injector;

  displayName: any;
  email: any;
  familyName: any;
  givenName: any;
  userId: any;
  imageUrl: any;

  isLoggedIn:boolean = false;

  constructor(public http: Http, injector: Injector, private facebook: Facebook, private googlePlus: GooglePlus) {
    this.injector = injector;
  }
  //getOAuthProvider(source?: string): IOAuthProvider

  facebookLogin(){
    this.facebook.login(['email']).then( (response: any) => {
      //response.authResponse.accessToken

      console.log(JSON.stringify(response));

    }).catch((error: any ) => { console.log(error) });
  }

  googleLogin() {
    this.googlePlus.login({key: 'AIzaSyCsP1L6XSt2x1pp4vTZr-yImoYQpBLoBAw',
      webClientId: '268697679976-35ljh05ctikhee5bbhud421k4lqafkv7.apps.googleusercontent.com',
      clientId: '268697679976-64pa9hmcka78kk1gov4e7ujaohrv4ikq.apps.googleusercontent.com'})
      .then((res: any) => {
        console.log(res);
        this.displayName = res.displayName;
        this.email = res.email;
        this.familyName = res.familyName;
        this.givenName = res.givenName;
        this.userId = res.userId;
        this.imageUrl = res.imageUrl;

        this.isLoggedIn = true;
      })
      .catch((err:any) => { console.log(JSON.stringify(err)); console.error('Here is the error kip',err) } );
  }
  googleLogout() {
    this.googlePlus.logout()
      .then((res:any) => {
        console.log(res);
        this.displayName = "";
        this.email = "";
        this.familyName = "";
        this.givenName = "";
        this.userId = "";
        this.imageUrl = "";

        this.isLoggedIn = false;
      })
      .catch((err:any) => console.error(err));
  }

}
