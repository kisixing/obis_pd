import myAxios from "../utils/myAxios";

const FRONT_URL = 'historicalRecords/';

export default {
  /**
   * 获取历史病历树状结构
   */
  gethistoricalrecords: function() {
    let uri = 'findTree';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}`));
  }
}