// 中孕超声 名命跟随服务器字段
import myAxios from "../utils/myAxios";

export default {
  /**
   * 获取中孕超声信息
   * entity :{
   *   userid,
   *   recordid
   * }
   */
  getPrenatalPacsMg: function (entity) {
    return this.userId().then(r => myAxios.get(`prenatalQuery/getPrenatalPacsMg?userid=${r.object.userid}&recordid=${entity.recordid}`));
  },
  /**
   * 保存中孕超声信息
   */
  writePrenatalPacsMg: function (entity) {
    return this.userId().then(r => myAxios.post(`prenatalWrite/writePrenatalPacsMg`,{userid: r.object.userid, ...entity}));
  }
}