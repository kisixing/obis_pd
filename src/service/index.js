import myAxios, * as method from '../utils/myAxios';

import axios from 'axios';

import { default as medicalrecord } from './medicalrecord';
import { default as operation } from './operation.js';
import { default as historicalrecord } from './historicalrecord.js';
import { default as ultrasound } from './ultrasound.js';
import { default as outcome } from './outcome.js';
import { default as opencase } from './opencase.js';
import { default as template } from "./template";

// TODO 这里的userId应该以后优化
let userId = null;
let watchInfoList = [];

// 此页全写 get 方法

export default {
  ...method,
  watchInfo: function (fn) {
    watchInfoList.push(fn);
    return () => watchInfoList = watchInfoList.filter(f => f !== fn);
  },

  /**
   * 根据 身份证号/就诊卡号/手机/建档号 搜索
   */
  findUser: async function ({ usermcno = "", useridno = "", usermobile = "", chanjno = "", id ="" }) {
    // 这里的userid字段名称不是userid 而是 id
    // 修改字段后再return Promise
    // 由于接口是使用本页面的userId，所以要在这里设置
    const res = await myAxios.get(`prenatalQuery/findUser?useridno=${useridno}&usermcno=${usermcno}&usermobile=${usermobile}&chanjno${chanjno}=&id=${id}`);
    userId = new Promise(resolve => resolve(JSON.parse(JSON.stringify(res))));
    return userId;
    // res['object']['tuserweek'] = res['object']['gesweek'];
    // userId = new Promise(resolve => resolve(res));
    // return userId;
  },
  // 查询-产前诊断-基本信息
  getgeneralinformation: ({ userId }) => myAxios.get(`/prenatalQuery/getgeneralinformation?userid=${userId}`),
  /**
   * 修改 孕妇基本页面 中的信息
   */
  upDataDoc: (data) => {
    return myAxios.put('/outpatientWriteRestful/udpateDoc',data);
  },  
  /**
   * 获取个人信息
   */
  getuserDoc: function () {userId = myAxios.get('outpatientRestful/getuserDoc' + location.search);return userId;},
  /**
   * 高危数据
   */
  highrisk: function () {
    return myAxios.get('outpatientRestful/findHighriskTree')
  },
  /**
   * 高危弹出提醒判断
   */
  checkHighriskAlert: function (id) {
    return myAxios.post('outpatientWriteRestful/checkHighriskAlert', { userid: id, inputType: '2', data: '' });
  },
  /**
   * 高危弹出提醒不再提示
   */
  closeHighriskAlert: function (id, params) {
    return myAxios.post('outpatientWriteRestful/closeHighriskAlert', { userid: id, mark: params });
  },
  /**
   * 添加高危标记
   */
  addHighrisk: function (userid, highrisk, level) {
    return myAxios.post('outpatientWriteRestful/addHighrisk', { userid, highrisk, level });
  },
  /**
   * 孕妇建册
   */
  fileCreate: function (entity) {
    return axios.post('http://120.77.46.176/#/fileCreate', entity);
  },
  /**
   * 检验报告
   */
  getListReport: function () {
    return userId.then(r => axios.get(`http://120.77.46.176:8899/rapi/outpatientRestful/getLisReport?userid=${r.object.userid}`))
  },
  /**
   * 影像报告
   */
  getPacsData: function () {
    return userId.then(r => axios.get(`http://120.77.46.176:8899/rapi/outpatientRestful/getPacsData?userid=${r.object.userid}`))
  },
  /**
   * 专科病历 所需API
   */
  medicalrecord: Object.assign(medicalrecord, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * 手术记录所需API
   */
  operation: Object.assign(operation, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * 历史记录所需API
   */
  historicalrecord: Object.assign(historicalrecord, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * 历史记录所需API
   */
  ultrasound: Object.assign(ultrasound, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * 分娩结局结果
   */
  outcome: Object.assign(outcome, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * 孕妇建册
   */
  opencase: Object.assign(opencase, { userId: () => userId, fireWatch: (...args) => watchInfoList.forEach(fn => fn(...args)) }),
  /**
   * template
   */
  template: template
}
