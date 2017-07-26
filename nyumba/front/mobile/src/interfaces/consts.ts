export interface QuizPayLType{tgt: string,val: any,fill: boolean, role?:string,options?:Array<any>}
export interface Bill{id?:number, bal: number}
export interface Apt{name?: string, id?: string, rooms?: Array<Room>, selectedRooms?:Array<Room>}
export interface Room{id?: number, name?: string,rent: number, bills: Array<Bill>, personList: Array<Person>}
export interface Person{id?: string, claims?: any, username?: string, apts?: Array<Apt>}
export interface UserOptions {
  username: string,
  password: string
}
export interface Details{id?: string}
export interface QuizType{key?: string, label?: string, value?:string,required?:boolean,order:number,type?:string, hidden?: boolean, ctrlType: string};
export interface LabelValueType{key?: string, label?: string, value?: string};
export interface EditArgs{title: string, model: string,target:string,parentId:number,jsonPath:Array<{key:string,id:string}> }
export interface Action {}

export interface IOathProvider<T> {
  login(): Promise<T>;
}
export interface OAuthToken {
  accessToken: string;
  source: string;
}

export class State {
  //"message" message is set by HTTP_FAILED action in reducer and reset when user clicks to dismiss message.
  message: any = null;
  persist: boolean = false;
  searchResults: Array<any> = [];
  //Don't put any default value inside users. It will mess things up. Just leave it as empty array.
  users: Array<Person> = [];
}

//location path constants
export const usersPath =    [{key: 'users', id: ''}];
export const aptsPath =     [{key: 'users', id: ''},{key: 'apts', id:''}];
export const roomsPath =    [{key: 'users', id: ''},{key: 'apts', id:''},{key: 'rooms',id: ''}];
export const paymentsPath = [{key: 'users', id: ''},{key: 'apts', id:''},{key: 'rooms',id: ''},{key:'bills',id:''}];
export const personsPath =  [{key: 'users', id: ''},{key: 'apts', id:''},{key: 'rooms',id: ''},{key:'personList', id:''}];

export const HTTP_CALL = 'HTTP_CALL';
export const HTTP_SUCCESS = 'HTTP_SUCCESS';
export const HTTP_FAILED = 'HTTP_FAILED';

export const RESET_MESSAGE = 'RESET_MESSAGE';
export const RESET_PERSIST = 'RESET_PERSIST';

//export const SAVE_TO_BACKEND = 'SAVE_TO_BACKEND';
//export const SAVE_TO_BACKEND_SUCCESS = 'SAVE_TO_BACKEND_SUCCESS';
//export const SAVE_TO_BACKEND_FAILED = 'SAVE_TO_BACKEND_FAILED';


export const SHOW_MESSAGE = 'SHOW_MESSAGE';
export const LOGOUT = 'LOGOUT';
export const RESTORE_USER = 'RESTORE_USER';

export const aptModel = 'Building';
export const roomModel = 'Room';
export const billModel = 'Bill' || 'Payment';
export const tenantModel = 'Tenant';
export const userModel = 'User';

export const localStoredUser = 'localStoredUser';
export const localSelectedApts = 'localSelectedApts'

export const romDtTgt = 'bills';

export interface GlobalPageInterface {
  title: string;
  name: string;
  component?: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

export const AppWidePages: GlobalPageInterface[] = [
  { title: 'Home', name: 'TabsPage', index: 0, icon: 'home', logsOut: true },
  { title: 'Schedule', name: 'TabsPage', index: 1, icon: 'calendar', logsOut: true },
  { title: 'Speakers', name: 'TabsPage', index: 2, icon: 'contacts' , logsOut: true},
  { title: 'Map', name: 'TabsPage', index: 3, icon: 'map' , logsOut: true},
  { title: 'About', name: 'TabsPage', index: 4, icon: 'information-circle', logsOut: true }
];
export const appNavHistory: Array<any> = [];
