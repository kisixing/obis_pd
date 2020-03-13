import myAxios from "../utils/myAxios";

let templateUri = 'prenatal/mrTemplate';
export default {
  /**
   * 获取模板
   * @param doctor
   * @param type
   */
  getTemplate: function({doctor, type}) {
    return myAxios.get(`${templateUri}?doctor=${doctor}&type=${type}`);
  },
  /**
   * 新增模板
   * @param docter
   * @param type
   * @param content
   */
  addTemplate: function({doctor, type, content}) {
    return myAxios.post(templateUri,{doctor,type,content})
  },
  /**
   * 删除模板
   * @param key
   * @returns {AxiosPromise}
   */
  deleteTemplate: function(entity) {
    return myAxios.delete(templateUri, {data:entity})
  },
  /**
   * 移动模板
   * @param key
   * @param sortAction
   * @returns {AxiosPromise<any>}
   */
  sortTemplate: function({key, sortAction}) {
    let uri = 'prenatal/sortMrTemplate';
    return myAxios.post(uri,{key, sortAction});
  }
}
