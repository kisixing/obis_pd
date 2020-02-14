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
   *
   */
  getOperationdetail: function (entity) {
    let uri = 'getoperationdetail';
    // NOTICE 这里使用25121
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}&operationRecordsTreeId=${entity.recordid}`));
  }
}