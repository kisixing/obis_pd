import { CHECK_HIGHRISK_ALERT, CLOSE_HIGHRISK_ALERT, SET_USER_DATA, SET_OPENCASE_DATA } from './actionTypes.js'
const defaultState = {
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
    const newState = JSON.parse(JSON.stringify(state));
    newState.highriskAlert = action.data;
    return newState;
  }
  if(action.type === CLOSE_HIGHRISK_ALERT) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.highriskAlert[action.index].visible = false;
    return newState;
  }
  if(action.type ===  SET_USER_DATA) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.userData = action.data;
    return newState;
  }
  if(action.type === SET_OPENCASE_DATA) {
    const newState = JSON.parse(JSON.stringify(state));
    console.log(action);
    newState.openCaseData = action.data;
    return newState;
  }
  return state;
}