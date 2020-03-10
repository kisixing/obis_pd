import { 
  CHECK_HIGHRISK_ALERT, CLOSE_HIGHRISK_ALERT, SET_USER_DATA,
  START_FETCH, FETCH_END
 } from './actionTypes.js'
const defaultState = {
  isFetching: false,
  highriskAlert:[],
  userData: {},
  /** 
   * 此处名命data为服务器返回建档信息
   * 用于后面页面的自动填充
   * */ 
  openCaseData: {}
}

export default (state = defaultState, action) => {
  if(action.type === CHECK_HIGHRISK_ALERT) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.highriskAlert = action.data;
    return newState;
  }
  if(action.type === CLOSE_HIGHRISK_ALERT) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.highriskAlert[action.index].visible = false;
    return newState;
  }
  if(action.type ===  SET_USER_DATA) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.userData = action.data;
    const { yunc, chanc,  gesmoc, gesexpect} = action.data;
    newState.openCaseData = {
      parity: {value: chanc, label: chanc},
      gravidity: {value: yunc, label: yunc},
      lmd: gesmoc,
      edd: gesexpect
    }
    return newState;
  }
  // if(action.type ===  START_FETCH){
  //   let newState = JSON.parse(JSON.stringify(state));
  //   newState.isFetching = true;
  //   return newState;
  // }
  return state;
}