import {
  Action,
  HTTP_CALL, HTTP_FAILED, HTTP_SUCCESS, LOGOUT, RESTORE_USER, SET_EDIT_MODE,
  State
} from "../interfaces/constants";

export const AppWideReducer = (state = new State(), action: Action) => {

  let pl = action.pl;
  let nextState: any = {};
  Object.assign(nextState,state);
  nextState['msg'] = pl ? pl.msg:'';

  switch(action.type){

    case HTTP_SUCCESS: {

      if(pl.tgt == 'search'){
        nextState['searchResults'] = pl.obj;
      }else if(pl.obj && pl.jsonPath){
        findAndUpdateArray(pl.jsonPath,nextState,pl.obj,pl.msg == 'deleted');
        nextState['user'] = nextState.users[0];
      }else{
        console.debug('Success request not handled..');
      }
      return nextState;
    }
    case HTTP_CALL: {
      return nextState;
    }
    case HTTP_FAILED: {
      console.log('Handling failed request...');
      //Anything that is not 200 ok will be handled here.

      if( pl.msg === 'deleted' && pl.jsonPath && pl.obj){
        //remove from state and then set the persist flag
        findAndUpdateArray(pl.jsonPath,nextState,pl.obj,true);
      }
      return nextState;
    }
    case LOGOUT: {
      //This action should be invoked only by the observable in app.component.ts.
      //To trigger the login/logout process, dispatch a SEND_MESSAGE action with msg: 'logout' or msg: 'loginSuccess';
      console.log('Logging out in reducers...');
      //TODO: And invalidate security token at this point
      nextState.editMode = false;
      nextState['users'] = [];
      nextState['user'] = undefined;
      nextState['msg'] = 'logout';
      return nextState;
    }
    case RESTORE_USER: {
      nextState.users.push(pl.user);
      nextState.user = nextState.users[0];
      nextState['msg'] = 'loginSuccess';
      return nextState;
    }
    case SET_EDIT_MODE: {
      nextState.editMode = pl.editMode;
      return nextState;
    }
    //always have default return of previous state when action is not relevant
    default:
      return state;
  }
};
function findAndUpdateArray(path:Array<any>,obj:any,objToPush:object, deleted: boolean): any[]{

  let baseObj = obj ;
  for(let i = 0 ; i < path.length; i++){
    let p = path[i];
    if(p.id === null || p.id === '' || i === path.length - 1 ){
      replaceOrAddOrDelete(objToPush,baseObj,p.key,deleted);
    }else{
      baseObj = baseObj[p.key];
      //find obj for given id within current obj
      baseObj = baseObj.find((arg:any) => arg.id == p.id )
    }
  }
  return baseObj
}
function replaceOrAddOrDelete( objToPush:any,baseObj:any, key:any,deleted:boolean){

  let arrObj = baseObj[key];
  //If we returned an array from backend, then replace existing array. Else
  // search existing array and replace object or push object if not found.
  if(objToPush instanceof Array){
    baseObj[key] = objToPush;
  }else{
    let index = arrObj.findIndex( (obj:any) => obj.id === objToPush.id );

    if(deleted){
      baseObj[key] = arrObj.filter((obj:any) => obj.id !== objToPush.id )
    }else if(~index){
      //Tilde means if index was found
      arrObj[index] = objToPush;
    }else{
      arrObj.push(objToPush);
    }
  }
}

