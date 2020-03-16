import React, { Component } from 'react';
import { Select, Button, message, Cascader } from 'antd';
import store from '../store/index';
import service from '../../service/index.js';
import { setUserData } from '../store/actionCreators'
import { GetExpected } from '../../utils/index';

import formRender,{ fireForm } from '../../render/form';
import Page from '../../render/page';

import "../index.less";
import "./index.less";

import { hyOptions, numberOptions, IDCardOptions, occupationOptions } from './data.js';
import cityOptions from '../../utils/cascader-address-options';
import  NO2ROOT from '../../utils/china-division/no2root';

const IDReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;

const getDataFromID = (id) => {
  console.log(id);
  if(!id || !IDReg.test(id) ) return false;
  let root = '';
  for(let i = 0 ; i < NO2ROOT.length ; i++){
    if(NO2ROOT[i].code === id.substring(0,6)){
      root = NO2ROOT[i].name;
      break;
    }
  }
  console.log(root);
  return {
    age: Number(new Date().getFullYear()) - Number(id.substring(6,10)),
    root: root
  }
}
export default class OpenCase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pregnancyData: {
        useridno: [{label: "居民身份证", value: "居民身份证"},""],
        userhidno: {},
        useridtype: {label: "居民身份证", value: "居民身份证"},
        ADD_FIELD_husband_useridtype: {label:"居民身份证",value:"居民身份证"}
      },
      benYunData: {
        yunc: {label: '0', value: '0'},
        chanc: {label: '0', value: '0'}
      }
    };
  }
  /* ======================= UI视图渲染config =============================== */
  // 孕妇基本信息
  pregnancy_data_config = () => ({
    step: 1,
    className: 'container',
    rows: [
      // {
      //   columns: {
      //     span: 24,
      //     rows: [
      //       {name: 'a', type: 'input'}
      //     ]
      //   }
      // },
      {
        columns: [
          { label: '孕妇信息', span: 12  }
        ]
      },
      {
        columns: [
          {name: 'usermcno[门诊号]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'zhunshengzheng[准生证号]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'username[姓名]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {
            name: 'useridno[身份证]', type: [{type: 'select',options: IDCardOptions, valid: 'required', span: 10},{type:'input', span: 14, valid: 'required'}], span: 8, valid: ['required',(value = {}) => {
              const IDType = ('0' in value) ? value['0'] : "", IDNumber = ('1' in value) ? value['1'] : "";
              if(!IDType)  return "*请选择证件类型";
              if(IDType.value === '居民身份证' && IDNumber) {
                if(IDReg.test(IDNumber)){
                  if(Number(IDNumber.slice(16,17)) % 2 === 1) return "*请输入女性身份证";
                }else{
                  return "*居民身份证格式错误"
                }
              }
            }]
          },
          {span: 1},
          {name: 'userage[年龄]', type: 'input', span: 6, valid: 'required'},
          
        ]
      },
      {
        columns: [
          {name: 'usernation[国籍]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'userroots[籍贯]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'userpeople[民族]', type: 'input', span: 6, valid: 'required'}
        ]
      },
      {
        columns: [
          // new
          // {name: 'danw[工作单位]', type: 'input', span: 6, valid: 'required'},
          {name: 'useroccupation[职业]', type: 'select', span: 6, options: occupationOptions},
          {span: 1},
          {
            name: 'usermobile[手机]', type: 'input', span: 6, valid: ["required", (value = '') => {
              if(value !== "") {
                if(!/^1[3456789]\d{9}$/.test(value)){
                  return "*请输入正确的手机号码"
                }
              }
            }]
          }
        ]
      }
    ]
  });

  // 丈夫信息
  husband_data_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          { label: '丈夫信息', span: 12  }
        ]
      },
      {
        columns: [
          {name: 'userhmcno[门诊号]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'userhname[姓名]', type: 'input', span: 6},
          {span: 1},
          {
            name: 'userhidno[身份证]', type: [{type: 'select',options: IDCardOptions, span: 10, name: '0'},{type:'input', span: 14, name: '1'}], span: 8, valid: (value = {}) => {
              console.log(value);
              console.log('0' in value);
              const IDType = ('0' in value) ? value['0'] : "", IDNumber = ('1' in value) ? value['1'] : "";
              if(!IDType && IDNumber) {
                return "*请选择证件类型";
              }
              if(IDType.value === '居民身份证' && IDNumber) {
                if(IDReg.test(IDNumber)){
                  if(Number(IDNumber.slice(16,17)) % 2 === 0){
                    return "*请输入男性身份证";
                  }
                }else{
                  return "*居民身份证格式错误"
                }
              }
            }
          },
          {span: 1},
          {name: 'userhage[年龄]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'userhnation[国籍]', type: 'input', span: 6},
          {span: 1},
          {name: 'userhroots[籍贯]', type: 'input', span: 6},
          {span: 1},
          {name: 'userhpeople[民族]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'userhoccupation[职业]', type: 'select', span: 6, options: occupationOptions},
          {span: 1},
          {name: 'userhmobile[手机]', type: 'input', span: 6}
        ]
      },
    ]
  })

  other_data_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {label: '其他信息', span: 12}
        ]
      },
      {
        columns: [
          {
            name: 'useraddress[居住地址]', type: [{type: 'cascader', options: cityOptions, span: 6},{type:'input', vaild: 'required', span: 15}], span: 24, valid: ['required',(value = {}) => {
              if(!value['0'] || !value['1']){
                return '*请输入完整户口地址';
              }
            }]
          },
        ]
      },
      {
        columns: [
          {name: 'userconstant[户口地址]', type: [{type: 'cascader', options: cityOptions,  span: 6},{type:'input', valid: 'required', span: 15}],span: 24, valid: ['required',(value = {}) => {
            if(!value['0'] || !value['1']){
              return '*请输入完整居住地址';
            }
          }]},
        ]
      }
    ]
  })

  benyun_data_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {label: '孕产史信息', span: 12},
        ]
      },
      {
        columns: [
          {name: 'marry[婚姻状态]', type: 'select', span: 6, options: hyOptions, valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'yunc[孕次]', value: 0, type: 'select', span: 6, options: numberOptions,  valid: 'required'},
          {span: 1},
          {name: 'chanc[产次]', value: 0, type: 'select', span: 6, options: numberOptions,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'gesmoc[末次月经]', type: 'date', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'gesexpect[预产期]', type: 'date', span: 6,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'cktizh[孕前体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'ckcurtizh[现体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'cksheng[身高](cm)', type: 'input', span: 6,  valid: 'required'},
        ]
      }
    ]
  });


  /* ======================= handler =============================== */
  handlePregnancyChange = (_,{name,value,error}) => {
    // 统一错误提示
    if(error) {
      console.log(error);
      message.error(error);
      return ;
    } 
    console.log(value);
    const { pregnancyData } = this.state;
    let obj = JSON.parse(JSON.stringify(pregnancyData));
    switch(name){
      case 'useridno':{
        obj['useridno'] = value;
        console.log(value);
        const IDType = '0' in value ? value['0'] : "", IDNumber = '1' in  value ? value['1'] : "";
        console.log(IDType);
        console.log(IDNumber);
        if(IDType.value === '居民身份证') {
          obj['usernation'] = '中华人民共和国';
          const res = getDataFromID(IDNumber);
          console.log(res);
          if(res){
            obj['userage'] = res.age;
            obj['userroots'] = res.root;
          }
        }
        break;
      }
      case 'userhidno':{
        obj['userhidno'] = value;
        const IDType = '0' in value ? value['0'] : "", IDNumber = '1' in  value ? value['1'] : "";
        if(IDType.value === '居民身份证') {
          obj['userhnation'] = '中华人民共和国';
          const res = getDataFromID(IDNumber);
          if(res) {
            obj['userhage'] = res.age;
            obj['userhroots'] = res.root;
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
        // 转换数据格式
        benYunData['chanc'] = Number(benYunData['chanc'].value);
        benYunData['yunc'] = Number(benYunData['yunc'].value);
        // 孕妇建档
        console.log(pregnancyData);
        service.opencase.addyc({...pregnancyData, ...benYunData}).then(res => {
          if(res.data.code === "200" || res.data.code === "1") {
            message.success('孕妇建档成功');
            const id = res.data.object.id; 
            res.data.object['tuseryunchan'] = `${res.data.object['yunc']}/${res.data.object['chanc']}`;
            res.data.object['userid'] = id;
            store.dispatch(setUserData(res.data.object))
            // 保存孕妇信息
            service.opencase.useryc({id,...pregnancyData, ...benYunData}).then(uRes => {
              if(uRes.data.code === "200" || uRes.data.code === "1") {
                message.success('保存信息成功');
                this.props.history.push('/pregnancy');
              }else {
                message.error(uRes.data.message)
              }
            });
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
    console.log(this.state);
    const { pregnancyData, benYunData } = this.state;
    return (
      <Page id="form-block">
        <div className="bgWhite pad-mid">
          <div className="container">
            {formRender(pregnancyData,this.pregnancy_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(pregnancyData,this.husband_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(pregnancyData,this.other_data_config(), this.handlePregnancyChange)}
          </div>
          <div className="container">
            {formRender(benYunData,this.benyun_data_config(), this.handleBenYunChange)}
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
