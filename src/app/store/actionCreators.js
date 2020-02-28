import { CHECK_HIGHRISK_ALERT, CLOSE_HIGHRISK_ALERT, SET_USER_DATA, SET_OPENCASE_DATA } from './actionTypes.js'
 
export const getAlertAction = (data) => ({
  type: CHECK_HIGHRISK_ALERT,
  data
});

export const closeAlertAction = (index) => ({
  type: CLOSE_HIGHRISK_ALERT,
  index
});

export const setUserData = (data) => ({type: SET_USER_DATA, data});

export const setOpenCaseData = (data) => ({type: SET_OPENCASE_DATA, data});