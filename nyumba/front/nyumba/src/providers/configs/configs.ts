import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/**
 * Class used for configurations
 */
@Injectable()
export class ConfigsProvider {
  //public base_url = 'https://localhost:9443';
  public base_url = 'http://localhost:9000';
  public facebook = {
    apiUrl: 'https://graph.facebook.com/v2.3/',
    appId: '',
    scope: ['email']
  };
  public google = {
    apiUrl: 'https://www.googleapis.com/oauth2/v3/',
    appId: '268697679976-35ljh05ctikhee5bbhud421k4lqafkv7.apps.googleusercontent.com',
    scope: ['email']
  };
  public googleB = {
    apiUrl: 'https://accounts.google.com/o/oauth2/v2/auth?' +
    'scope=email&' +
    'access_type=offline&' +
    'include_granted_scopes=true&' +
    'state=MyState_TPass_ThroughKip&' +
    'redirect_uri='+encodeURI('http://localhost:9000/callback')+'&' +
    'response_type=code&' +
    'client_id=268697679976-35ljh05ctikhee5bbhud421k4lqafkv7.apps.googleusercontent.com'
  };
  //client secret: lfL4pgqp5gsmVBTg8M0n49yk

}
