import React, { Component } from 'react';
import { Button, message } from 'antd';
import Page from '../../render/page';
import store from '../store/index';
import service from '../../service/index.js';

import { setUserData } from '../store/actionCreators'
import { GetExpected } from '../../utils/index';

import formRender,{ fireForm } from '../../render/form';
import formRenderConfig from './formRender';
import { IDReg } from './validFn';
import { getInfoFormID } from './utils';
import "./index.less";

export default class OpenCase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pregnancyData: {
        useridno: [{label: "居民身份证", value: "居民身份证"},""],
        userhidno: [{label: "居民身份证", value: "居民身份证"},""],
        useridtype: {label: "居民身份证", value: "居民身份证"},
        userpeople: [],

        ADD_FIELD_husband_useridtype: {label:"居民身份证",value:"居民身份证"}
      },
      benYunData: {
        yunc: {label: '0', value: '0'},
        chanc: {label: '0', value: '0'}
      }
    };
  }


  /* ======================= handler =============================== */
  handlePregnancyChange = (_,{name,value,error}) => {
    console.log(value);
    // 统一错误提示
    if(error) {
      message.error(error);
      return ;
    } 
    const { pregnancyData } = this.state;
    let obj = JSON.parse(JSON.stringify(pregnancyData));
    switch(name){
      case 'useridno':{
        obj['useridno'] = value;
        const IDType = '0' in value ? value['0'] : "", IDNumber = '1' in  value ? value['1'] : "";
        if(IDType.value === '居民身份证') {
          obj['usernation'] = '中华人民共和国';
          const info = getInfoFormID(IDNumber);
          if(info){
            obj['userage'] = info.age;
            obj['userroots'] = info.root;
          }
        }
        break;
      }
      case 'userhidno':{
        obj['userhidno'] = value;
        const IDType = '0' in value ? value['0'] : "", IDNumber = '1' in  value ? value['1'] : "";
        if(IDType.value === '居民身份证') {
          obj['userhnation'] = '中华人民共和国';
          const info = getInfoFormID(IDNumber);
          if(info) {
            obj['userhage'] = info.age;
            obj['userhroots'] = info.root;
          }
        }
        break;
      }
      default:
        obj[name] = value;
        break;
    }
    this.setState({pregnancyData: obj});
  };

  handleBenYunChange = (_,{name,value}) => {
    const { benYunData } = this.state;
    let obj = Object.assign({}, benYunData); 
    if(name === 'gesmoc'){
      const gesexpect = GetExpected(value);
      obj['gesexpect'] = gesexpect;
    }
    obj[name] = value;
    this.setState({benYunData: obj});
  };
  
  // 
  handleSave = () => {
    const { pregnancyData, benYunData } = this.state;
    console.log(pregnancyData);
    fireForm(document.getElementById('form-block'),'valid').then(valid => {
      if(valid){
        // 身份证处理 - 证件类型转成字符串
        pregnancyData['useridtype'] = JSON.stringify(pregnancyData['useridno']['0']);
        pregnancyData['useridno'] = pregnancyData['useridno']['1'];
        pregnancyData['ADD_FIELD_husband_useridtype'] = JSON.stringify(pregnancyData['userhidno']['0']);
        pregnancyData['userhidno'] = pregnancyData['userhidno']['1'];
        if(!pregnancyData.userhidno){
          pregnancyData['ADD_FIELD_husband_useridtype'] = "";
          pregnancyData['userhidno'] = "";
        }
        // 转换职业信息
        pregnancyData['useroccupation'] = ('useroccupation' in pregnancyData) ? JSON.stringify(pregnancyData['useroccupation']) : '';
        pregnancyData['userhoccupation'] = ('userhoccupation' in pregnancyData) ? JSON.stringify(pregnancyData['userhoccupation']) : '';
        // 地址型中间加个空格
        pregnancyData['useraddress'] = pregnancyData['useraddress']['0'].replace(/\//g,' ') + ' ' + pregnancyData['useraddress']['1']; 
        pregnancyData['userconstant'] = pregnancyData['userconstant']['0'].replace(/\//g,' ') + ' ' + pregnancyData['userconstant']['1']; 
        // 民族
        pregnancyData['userpeople'] = ('userpeople' in pregnancyData) ? JSON.stringify(pregnancyData['userpeople']) : '';
        pregnancyData['userhpeople'] = ('userhpeople' in pregnancyData) ? JSON.stringify(pregnancyData['userhpeople']) : '';
        // 转换数据格式
        benYunData['chanc'] = Number(benYunData['chanc'].value);
        benYunData['yunc'] = Number(benYunData['yunc'].value);
        // 孕妇建档
        service.opencase.addyc({...pregnancyData, ...benYunData}).then(res => {
          if(res.data.code === "200" || res.data.code === "1") {
            message.success('孕妇建档成功');
            res.data.object['tuseryunchan'] = `${res.data.object['yunc']}/${res.data.object['chanc']}`;
            res.data.object['userid'] = res.data.object.id;
            
            // 保存孕妇信息
            service.opencase.useryc({id: res.data.object.id,...pregnancyData, ...benYunData}).then(uRes => {
              if(uRes.data.code === "200" || uRes.data.code === "1") {
                message.success('保存信息成功');
                this.props.history.push('/pregnancy');
              }else {
                message.error(uRes.data.message)
              }
            });
            // 需要等待服务器后才可以做，因为服务器会迟1、2秒
            setTimeout(() => {
              store.dispatch(setUserData(res.data.object))
            }, 2000);
          }else {
            message.error(res.data.message)
          }; 
        });
      }else {
        message.error('请填写所以必填信息后再次提交');
      }
    })
  };

  render() {
    const { pregnancyData, benYunData } = this.state;
    return (
      <Page id="form-block">
        <div className="bgWhite pad-mid">
          <div className="container">
            {formRender(pregnancyData,formRenderConfig.pregnancy_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(pregnancyData,formRenderConfig.husband_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(pregnancyData,formRenderConfig.other_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(benYunData,formRenderConfig.benyun_data_config(), this.handleBenYunChange)}
          </div>
        </div>
        <div className="btn-group pull-right bottom-btn">
          <Button className="blue-btn">重置</Button>
          <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
        </div>
      </Page>
    )
  }
}
