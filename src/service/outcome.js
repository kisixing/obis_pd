import myAxios from "../utils/myAxios";

const FRONT_URL = 'prenatal/';


export default {
  /**
   * 获取分娩结局结果
   */
  getDeliveryOutcome: function () {
    let uri = 'deliveryOutcome';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}`));
  },
  /**
   * 保存分娩结局结果
   */
  // http://120.77.46.176:8080/Obcloud/prenatal/deliveryOutcome
  saveDeliveryOutCome: function (entity) {
    let uri = 'deliveryOutcome';
    return this.userId().then(r => myAxios.post(`${FRONT_URL}${uri}`, entity));
  }
}
