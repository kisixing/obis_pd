import React, { Component } from "react";
import { message, Button } from 'antd';
import formRender from '../../render/form';
import Page from '../../render/page';
import service from '../../service/index';
import store from '../store';

import formRenderConfig from './formRender';
import { convertString2Json } from '../../utils/index';

import "../index.less";
import "./index.less";

const PATH_NAME = "/pregnancy";
export default class Patient extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userid: "",
      gravidaInfo: {},
      husbandInfo: {}
    };
    // 订阅store，变化时调用get拿值
    store.subscribe(() => {
        if(props.location.pathname === PATH_NAME) {
          this.getGeneralInformation()
        }
      }
    )
  }

  componentDidMount() {
    this.getGeneralInformation()
  };

  /* ====================  请求处理 ============================= */
  getGeneralInformation = () => {
    const { userid } = store.getState()['userData'];
    console.log(userid);
    // 防止已进入页面没有userid
    if(userid) {
      service.getgeneralinformation({userId: userid}).then((res) => {
        const obj = this.convertPregnancyData(res.object);
        this.setState({userid: obj.userid, gravidaInfo: obj.gravidaInfo, husbandInfo: obj.husbandInfo},() => console.log(this.state));
      })
    }else {
      message.info('请输入孕妇门诊号/身份证/手机号码进行信息获取',5);
    }
  };

  handleSave = () => {
    const { userid, gravidaInfo, husbandInfo} = this.state;
    // 这里的userid 要输入 id...
    service.upDataDoc({id: this.state.userid, ...gravidaInfo}).then(res => {
      if(res.code === "200"){
        message.success('保存信息成功');
      }
    })
    service.upDataDoc({id: userid, ...husbandInfo}).then(res => {
      if(res.code === "200"){
        message.success('保存信息成功');
      }
    })
  }

  convertPregnancyData = (object) => {
    const { useroccupation, useridtype, useridno, userpeople } = object.gravidaInfo;
    const { userhoccupation, add_FIELD_husband_useridtype, userhpeople} = object.husbandInfo;
    // 整合职业数据 - 转格式
    if(useroccupation && useroccupation.indexOf('{') !== -1) {
      object.gravidaInfo.useroccupation = convertString2Json(useroccupation).label;
    }
    if(userhoccupation && userhoccupation.indexOf('{') !== -1) {
      object.husbandInfo.userhoccupation = convertString2Json(userhoccupation).label;
    }
    // 整合身份证类型数据 - 转格式
    if(useridtype && useridtype.indexOf('{') !== -1) {
      object.gravidaInfo.useridtype = convertString2Json(useridtype);
    }
    if(add_FIELD_husband_useridtype && add_FIELD_husband_useridtype.indexOf('{') !== -1) {
      object.husbandInfo.add_FIELD_husband_useridtype = convertString2Json(add_FIELD_husband_useridtype);
    }
    if(userpeople && userpeople.indexOf('{') !== -1) {
      object.gravidaInfo.userpeople = convertString2Json(userpeople);
    }
    if(userhpeople && userhpeople.indexOf('{') !== -1) {
      object.husbandInfo.userhpeople = convertString2Json(userhpeople);
    }
    // 剪切生日
    if(useridno){
      object.gravidaInfo.userbirth = `${useridno.substring(6,10)}-${useridno.substring(10,12)}-${useridno.substring(12,14)}`;
    }
    console.log(object);
    return object;
  }

  /* ====================  表单改变处理 ============================= */
  handleGravidaInfoChange = (_, {name, value }) => {
    let newObj = Object.assign({}, this.state.gravidaInfo);
    newObj[name] = value;
    this.setState({gravidaInfo: newObj});
  };
  handleHusbandInfo = (_, {name, value}) => {
    let newObj = Object.assign({}, this.state.husbandInfo);
    newObj[name] = value;
    this.setState({husbandInfo: newObj});
  };

  render(){
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="bgWhite pad-mid ">
          <div className="">
            {formRender(this.state.gravidaInfo, formRenderConfig.gravidaInfo_config(), this.handleGravidaInfoChange)}
            {formRender(this.state.husbandInfo, formRenderConfig.husbandInfo_config(), this.handleHusbandInfo)}
          </div>
          <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
          </div>
        </div>
      </Page>
    )
  }
}


