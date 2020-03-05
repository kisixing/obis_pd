import myAxios from '../utils/myAxios';

const FRONT_URL = 'prenatal/';

export default {
  /**
   * 获取专科病历列表
   */
  getspecialistemr: function () {
    let uri = 'getspecialistemr';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}`,));
  },

  /**
   * 查看专科病历详情
   */
  getspecialistemrdetail: function (entity) {
    let uri = 'getspecialistemrdetail';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}&recordid=${entity.recordid}`));
  },
  /**
   * 保存专科病例
   */

  savespecialistemrdetail: function (entity) {
    let uri = 'savespecialistemrdetail';
    console.log(entity);
    
    // if()
    // entity['ultrasound']['fetus'] = [];
    return this.userId().then(r => {
        console.log(r);
        entity['userid'] = r.object.userid;
        return myAxios.post(`${FRONT_URL}${uri}`, entity)
      }
    )
  },
  /**
   * 获取模板
   * entity :{ doctor: "xxxx", type: "drm1/2/3/4/5"}
   */

  getTemplate: function (entity) {
    let uri = 'mrTemplate';
    return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}&doctor=${entity.doctor}&type=${entity.type}`));
  },
  /**
   * 专科病历 - 胎儿疾病 - 既往史 - 获取手术记录
   */
  getOperationHistory: function () {
    return this.userId().then(r => myAxios.get(`outpatientRestful/getOperationHistory?userid=${r.object.userid}`))
  },
  /**
   * 专科病历 - 胎儿疾病 - 既往史 - 手术史
   */
  writeOperationHistory: (entity) => (this.userId().then(r => myAxios.post(`outpatientWriteRestful/writeOperationHistory`,{userid: r.object.userid, operationHistory: entity})))
}
