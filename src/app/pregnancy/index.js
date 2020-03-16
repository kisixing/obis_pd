import React, { Component } from "react";
import { message } from 'antd';
import formRender from '../../render/form';
import Page from '../../render/page';
import service from '../../service/index';
import store from '../store';

import { sfzOptions } from './data';

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
    // 防止已进入页面没有userid
    if(userid) {
      service.getgeneralinformation({userId: userid}).then((res) => {
        const obj = this.convertPregnancyData(res.object);
        this.setState({userid: obj.userid, gravidaInfo: obj.gravidaInfo, husbandInfo: obj.husbandInfo});
      })
    }else {
      message.info('请输入孕妇门诊号/身份证/手机号码进行信息获取',5);
    }
  };

  convertPregnancyData = (object) => {
    const { useroccupation, useridtype, useridno } = object.gravidaInfo;
    const { userhoccupation, add_FIELD_husband_useridtype } = object.husbandInfo;
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
    this.setState({gravidaInfhusbandInfoo: newObj});
  };
  /* ====================  UI视图渲染 ============================= */
  gravidaInfo_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          { name: 'userage[年龄]', type: 'input', span: 5, valid: 'required|number'},
          { span: 1 },
          { name: 'userbirth[出生日期]', type: 'date', span: 5,valid: 'required'},
          { span: 1 },
          { name: 'usercuzh[建档日期]', type: 'date', span: 5 ,valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'usernation[国籍]', type: 'input', span: 5 ,valid: 'required'},
          { span: 1 },
          { name: 'userroots[籍贯]', type: 'input', span: 5 ,valid: 'required'},
          { span: 1 },
          { name: 'userpeople[民族]', type: 'input', span: 4 ,valid: 'required'},
          { span: 1 },
          { name: 'useroccupation[职业]', type: 'input', span: 6 },
        ]
      }, {
        columns: [
          { name: 'usermobile[手机]', type: 'input', span: 5, valid: 'required|number' },
          { span: 1 },
          { name: 'useridtype[证件类型]', type: 'select', span: 4, showSearch: false, options: sfzOptions ,valid: 'required'},
          { span: 1 },
          { name: 'useridno[证件号码]', type: 'input', span: 6 ,valid: 'required'}
          // { name: 'phone[固话]', type: 'input', span: 5},
          // { span: 1 },
        ]
      }, {
        columns: [
          { name: 'userconstant[户口地址]', type: 'input', span: 11,valid: 'required'},
          { span: 1 },
          { name: 'useraddress[现住地址]', type: 'input', span: 11,valid: 'required'},
          { span: 1 },
        ]
      },
    ]
  });
  husbandInfo_config() {
    return {
      step: 1,
      rows: [
        {
          columns: [
            { name: 'userhname[丈夫姓名]', type: 'input', span: 5 },
            { name: 'userhage[年龄]', type: 'input', span: 4 },
            { span: 2 },
            { name: 'userhmcno[门诊号]', type: 'input', span: 6 },
          ]
        },
        {
          columns: [           
            { name: 'userhnation[国籍]', type: 'input', span: 5 },
            { name: 'add_FIELD_husband_userroots[籍贯]', type: 'input', span: 4 },
            { span: 2 },
            { name: 'userhpeople[民族]', type: 'input', span: 6 },
            { span: 1 },
            { name: 'userhoccupation[职业]', type: 'input', span:  6},
          ]
        },
        {
          columns: [
            { name: 'userhmobile[手机]', type: 'input', span: 5 },
            { name: 'add_FIELD_husband_useridtype[证件类型]', type: 'select', span: 4, options: sfzOptions },
            { span: 2 },
            { name: 'userhidno[证件号]', type: 'input', span: 6 },
            { span: 1 },
            { name: 'userhconstant[户口属地]', type: 'input', span: 6 }
          ]
        }
        // {
        //   columns: [
        //     { name: 'add_FIELD_husband_smoking(支/天)[抽烟]', type: 'input', span: 5 },
        //     // { name: entity=>'add_FIELD_husband_drink_data[喝酒]' + (!entity.add_FIELD_husband_drink_data[0]||isMY(entity.add_FIELD_husband_drink_data[0])?'(ml/天)':''), className:'h_26', span: 6, type: [
        //     //     { type: 'select', options: baseData.jiuOptions },
        //     //     { type:'input',filter: data=>!data||isMY(data[0])}
        //     //   ] 
        //     // },
        //     { name: 'userhjib[现有何病]', type: 'input', span: 12 }
        //   ]
        // }
      ]
    };
  };

  render(){
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="bgWhite pad-mid ">
          <div className="">
            {formRender(this.state.gravidaInfo, this.gravidaInfo_config(), this.handleGravidaInfoChange)}
            {formRender(this.state.husbandInfo, this.husbandInfo_config(), this.handleHusbandInfo)}
          </div>
        </div>
      </Page>
    )
  }
}


