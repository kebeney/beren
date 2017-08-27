import {Injector} from "@angular/core";

let appInjectorRef: Injector;
export const appInjector = (injector?: Injector):Injector => {
  if (injector) {
    appInjectorRef = injector;
  }

  return appInjectorRef;
};

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
export const SEND_MESSAGE = 'SEND_MESSAGE';

export const LOGOUT = 'LOGOUT';
export const RESTORE_USER = 'RESTORE_USER';
export const SET_EDIT_MODE = 'SET_EDIT_MODE';

export const aptModel = 'Building';
export const roomModel = 'Room';
export const billModel = 'Bill' || 'Payment';
export const tenantModel = 'Tenant';
export const userModel = 'User';

export const localStoredUser = 'localStoredUser';
export const localSelectedApts = 'localSelectedApts';

export const tenantRole = 'tenant';
export const landlordRole = 'landlord';

export const navOptionsBack =    {animate: true, animation: 'ios-transition',duration: 300, direction: 'back',    easing: 'ease-out' };
export const navOptionsForward = {animate: true, animation: 'ios-transition',duration: 300, direction: 'forward', easing: 'ease-out' };

export interface Claims{role:string,access_token:string}
export interface Person{id: number, claims: Claims, username?: string, apts: Array<Apt>}
export interface QuizPayLType{tgt: string,val: object|undefined,fill: boolean, role?:string,options?:Array<any>}
export interface Bill{id?:number, bal: number}
export interface Apt{id?: number,name?: string, landlordRooms?: Array<Room>, tenantRooms?:Array<Room>, hide?:boolean}
export interface Room{id?: number, name?: string,rent: number, bills: Array<Bill>, personList: Array<Person>}
export interface Details{id?: string}
export interface QuizType{key?: string, label?: string, value?:string,required?:boolean,order:number,type?:string, hidden?: boolean, ctrlType: string}
export interface LabelValueType{key?: string, label?: string, value?: string}
export interface JsonPath{key:string,id:string}
export interface ServerPL{ext: string, parentId?: number, obj: any, model: string ,jsonPath: JsonPath[], tgt?: string}

export interface BaseOPts{

  role: string;
  componentName: string;
  jsonPath: JsonPath[];
  model: string;
  tgt: string;
  title: string;

  user:Person|undefined;
  apt?:Apt;
  room?:Room;
  parent?: Person|Apt|Room;
}

export interface Payload{
  msg?:string,
  jsonPath?: JsonPath[];
  tgt?:string;
  obj?: object;
  method?: string;
  ext?: string;
  id?: number;
  editMode?: boolean;
  isLoggedIn?: boolean;
  persist?: boolean;
  searchResults?: Array<any>;
  users?: Array<Person> ;
  user?: Person;
}

export interface Action{type:string, pl: Payload }

export class State {
  //"message" message is set by HTTP_FAILED action in reducer and reset when user clicks to dismiss message.
  msg: string;
  editMode: boolean = false;
  searchResults?: Array<any> = [];
  //Don't put any default value inside users. It will mess things up. Just leave it as empty array.
  users: Array<Person> = [];
  user?: Person;


}
