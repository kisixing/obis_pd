import myAxios, * as method from '../utils/myAxios';

import axios from 'axios';

import { default as fuzhen } from './fuzhen';
import { default as shouzhen } from './shouzhen';
import { default as medicalrecord } from './medicalrecord';
import { default as operation } from './operation.js';

let userId = null;
let watchInfoList = [];

// 此页全写 get 方法

export default {
    ...method,
    watchInfo: function(fn){
        watchInfoList.push(fn);
        return () => watchInfoList = watchInfoList.filter(f=>f!==fn);
    },

    // 查询-产前诊断-基本信息
    getgeneralinformation: ({userId}) => myAxios.get(`/prenatalQuery/getgeneralinformation?userid=${userId}`),


    /**
     * 获取个人信息
     */
    getuserDoc: function(){
        userId = myAxios.get('/outpatientRestful/getuserDoc' + location.search);
        return userId;
    },
    /**
     * 高危数据
     */
    highrisk: function(){
        return myAxios.get('/outpatientRestful/findHighriskTree')
    },

    /**
     * 高危弹出提醒判断
     */
    checkHighriskAlert: function(id){
        return myAxios.post('/outpatientWriteRestful/checkHighriskAlert', {userid: id, inputType: '2', data: ''});
    },
    /**
     * 高危弹出提醒不再提示
     */
    closeHighriskAlert: function(id, params){
        return myAxios.post('/outpatientWriteRestful/closeHighriskAlert', {userid: id, mark: params});
    },
    /**
     * 添加高危标记
     */
    addHighrisk: function(userid, highrisk, level){
        return myAxios.post('/outpatientWriteRestful/addHighrisk', {userid, highrisk, level});
    },
    /**
     * 复诊所需API
     */
    fuzhen: Object.assign(fuzhen, { userId: ()=>userId, fireWatch: (...args)=>watchInfoList.forEach(fn=>fn(...args)) }),

    /**
     * 首诊所需API
     */
    shouzhen: Object.assign(shouzhen, { userId: ()=>userId, fireWatch: (...args)=>watchInfoList.forEach(fn=>fn(...args)) }),

    /**
     * 专科病历 所需API
     */
    medicalrecord: Object.assign(medicalrecord, {userId: () => userId, fireWatch: (...args)=>watchInfoList.forEach(fn=>fn(...args))}),

    /**
     * 手术记录所需API
     */
    operation: Object.assign(operation, {userId: () => userId, fireWatch: (...args)=>watchInfoList.forEach(fn=>fn(...args)) })
}
