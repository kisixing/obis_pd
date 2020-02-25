import axios from 'axios';

export default {
  // 保存孕妇基本信息
  useryc: function(entity) {
    let formData = new FormData();
    Object.keys(entity).forEach(key => {
      formData.append(key, entity[key]);
    })
    return axios.post("http://120.77.46.176/api/doc/useryc",formData);
  },
  addyc: function (entity) {
    let formData = new FormData();
    Object.keys(entity).forEach(key => {
      formData.append(key, entity[key]);
    })
    return axios.post("http://120.77.46.176/api/common/addyc",formData);
  }
}
