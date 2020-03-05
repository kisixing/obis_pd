import myAxios from '../utils/myAxios';
const FRONT_URL = 'prenatalQuery/';

export default {
  /**
   * 获取手术记录病历
   */
  getOperation: function () {
    let uri = 'getoperation';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}`,));
  },
  /**
   * 获取手术记录详细信息
   */
  getOperationdetail: function (entity) {
    let uri = 'getoperationdetail';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}&operationRecordsTreeId=${entity.recordid}`));
  },
  /**
   * 保存手术记录信息
   */
  saveOperation: function(entity) {
    delete entity.key;
    delete entity['templateId']; 
    return this.userId().then(r => myAxios.post(`prenatalWrite/saveOperation`,{userid: r.object.userid, ...entity}));
  }
}
