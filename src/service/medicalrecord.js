import myAxios from '../utils/myAxios';

const FRONT_URL = 'prenatal/';

export default {
    /**
     * 获取专科病历列表
     */
    getspecialistemr: function() {
        let uri = 'getspecialistemr';
        return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}`));
    },

    /**
     * 查看专科病历详情
     */
    getspecialistemrdetail: function(entity) {
        let uri = 'getspecialistemrdetail';
        return this.userId().then(r => myAxios.get(`${FRONT_URL}${uri}?userid=${r.object.userid}&recordid=${entity.recordid}`));
    }
}