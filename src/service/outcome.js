import myAxios from "../utils/myAxios";

const FRONT_URL = 'prenatal/';


export default {
  /**
   * 获取分娩结局结果
   */
  getDeliveryOutcome: function () {
    let uri = 'deliveryOutcome';
    return this.userId().then(r => myAxios(`${FRONT_URL}${uri}?userid=${r.object.userid}`));
  }
}