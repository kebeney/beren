import {
  HTTP_CALL, HTTP_FAILED,
  HTTP_SUCCESS,
  LOGOUT, RESET_MESSAGE, RESTORE_USER, SEND_MESSAGE, SET_EDIT_MODE,
  State
} from "../interfaces/consts";

export const componentReducer = (state = new State(), action: any) => {
    let nextState: any = {}; Object.assign(nextState,state);
    switch(action.type){
        case HTTP_SUCCESS: {
          console.log('Handling successful request...');
            //Handle only 200 ok responses here.
          let pl = action.payload;
          let data = pl.data;
          console.log('data is: ',data);

          if(typeof action.payload.tgt == 'string' && action.payload.tgt == 'search'){
            //replace search object and leave
            nextState['searchResults'] = data;
          }else if(typeof data !== 'undefined' && data !== null){
            findAndUpdateArray(action.payload.jsonPath,nextState,data);
            nextState['persist'] = true;
          }
          //TODO: merge these two into one. Figure out between data['msg'] and pl.msg . Look at message sending from backend.
          // if(data !== null && data && typeof data['msg'] === 'string'){
          //   nextState['msg'] = data['msg']
          // }
          if( typeof pl.msg == 'string'){
            nextState['msg'] = pl.msg;
            if(pl.msg === 'tokenExp'){
              nextState['isLoggedIn'] = false; nextState['users'] = [];
            }else if(pl.msg === 'loginSuccess'){
              nextState['isLoggedIn'] = true;
            }
          }
          console.log('nextState:',nextState);
          return nextState;
        }
        case HTTP_CALL: {
            return nextState;
        }
        case HTTP_FAILED: {
          console.log('Handling failed request...');
        //Anything that is not 200 ok will be handled here.
          let error = action.payload.data;
            if(typeof error['msg'] === 'string' && error['msg'].trim() === 'deleted'){
              //remove from state and then set the persist flag
              findAndUpdateArray(action.payload.jsonPath,nextState,action.payload.data);
              nextState['persist'] = true;
            }
            else if(error['msg'] != undefined ){ nextState['msg'] = error['msg'] }
            return nextState;
        }
        case RESET_MESSAGE: {
          console.log('Resetting message to null...');
            nextState['msg'] = null;
            return nextState;
        }
        case SEND_MESSAGE: {
          //Send message to whoever is listening for this message
          let myMsg = action.payload.msg;
          nextState['msg'] = myMsg;
          if(myMsg === 'logout'){nextState['isLoggedIn'] = false; nextState['users'] = []}
          if(myMsg === 'loginSuccess'){nextState['isLoggedIn'] = true;}
          return nextState;
      }
        case LOGOUT: {
          //This action should be invoked only by the observable in the home constructor.
          //To trigger the login/logout process, dispatch a SEND_MESSAGE action with msg: 'logout' or msg: 'loginSuccess';
          console.log('Logging out in reducers...');
          //TODO: And invalidate security token at this point
          nextState.editMode = false;
          nextState['users'] = [];
          nextState['isLoggedIn'] = false;
          nextState['msg'] = 'logoutSuccess';
          return nextState;
        }
        case RESTORE_USER: {
          nextState.users[0] = action.payload.user;
          nextState['isLoggedIn'] = true;
          return nextState;
        }
        case SET_EDIT_MODE: {
          nextState.editMode = action.payload.editMode;
          return nextState;
        }
        //always have default return of previous state when action is not relevant
        default:
            return state;
    }
};
function findAndUpdateArray(path:Array<any>,obj:any,objToPush:object): any[]{

    let baseObj = obj ;
    for(let i = 0 ; i < path.length; i++){
        let p = path[i];
        if(p.id === null || p.id === '' || i === path.length - 1 ){
          replaceOrAddOrDelete(objToPush,baseObj,p.key);
        }else{
            baseObj = baseObj[p.key];
            //find obj for given id within current obj
            baseObj = baseObj.find((arg:any) => arg.id == p.id )
        }
    }
    return baseObj
}
function replaceOrAddOrDelete( objToPush:any,baseObj:any, key:any){

    let msg = objToPush['msg'];

    let arrObj = baseObj[key];
    //If we returned an array from backend, then replace existing array. Else
    // search existing array and replace object or push object if not found.
    if(objToPush instanceof Array){
        baseObj[key] = objToPush;
    }else{
        let index = arrObj.findIndex( (obj:any) => obj.id === objToPush.id );

        if(typeof msg === 'string' && msg === 'deleted'){
            baseObj[key] = arrObj.filter((obj:any) => obj.id !== objToPush.id )
        }else if(~index){
            //Tilde means if index was found
            arrObj[index] = objToPush;
        }else{
            arrObj.push(objToPush);
        }
    }
}
