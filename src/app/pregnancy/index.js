import React, { Component } from "react";
import { Select, Button, Popover, Input, Tabs, Tree, Modal, Icon, Spin, Timeline, Collapse, message } from 'antd';


import * as baseData from './data';
import formRender from '../../render/form';
import Page from '../../render/page';
import * as util from './util';
import editors from '../shouzhen/editors';

import store from '../store';

import "../index.less";
import "./index.less";

const Panel = Collapse.Panel;

function modal(type, title) {
  message[type](title, 3)
}

export default class Patient extends Component {
  static Title = '孕妇信息';
  static entityParse(obj = {}){
    return {
      ...obj.gravidaInfo,
      useridtype: JSON.parse(obj.gravidaInfo.useridtype)
    }
  }
  static entitySave(entity = {}){
    return {
      ...entity
    }
  }
  constructor(props) {
    super(props);
  }

  config() {
    return {
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
            { name: 'useroccupation[职业]', type: 'input', span: 6 ,valid: 'required'},
          ]
        }, {
          columns: [
            { name: 'usermobile[手机]', type: 'input', span: 5, valid: 'number|required' },
            { span: 1 },
            { name: 'phone[固话]', type: 'input', span: 5},
            { span: 1 },
            { name: 'useridtype[证件类型]', type: 'select', span: 4, showSearch: false, options: baseData.sfzOptions ,valid: 'required'},
            { span: 1 },
            { name: 'useridno[证件号码]', type: 'input', span: 6 ,valid: 'required'}
          ]
        }, {
          columns: [
            { name: 'userconstant[户口地址]', type: 'input', span: 11,valid: 'required'},
            { span: 1 },
            { name: 'useraddress[现住地址]', type: 'input', span: 11,valid: 'required'},
            { span: 1 },
          ]
        },
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
            { name: 'add_FIELD_husband_useridtype[证件类型]', type: 'select', span: 4, options: baseData.sfzOptions },
            { span: 2 },
            { name: 'userhidno[证件号]', type: 'input', span: 6 },
            { span: 1 },
            { name: 'userhconstant[户口属地]', type: 'input', span: 6 }
          ]
        },
        {
          columns: [
            { name: 'add_FIELD_husband_smoking(支/天)[抽烟]', type: 'input', span: 5 },
            // { name: entity=>'add_FIELD_husband_drink_data[喝酒]' + (!entity.add_FIELD_husband_drink_data[0]||isMY(entity.add_FIELD_husband_drink_data[0])?'(ml/天)':''), className:'h_26', span: 6, type: [
            //     { type: 'select', options: baseData.jiuOptions },
            //     { type:'input',filter: data=>!data||isMY(data[0])}
            //   ] 
            // },
            { name: 'userhjib[现有何病]', type: 'input', span: 12 }
          ]
        },
      ]
    };
  }

  handleChange(e, { name, value, target }){
    const { onChange } = this.props;
    onChange(e, { name, value, target })
    // 关联变动请按如下方式写，这些onChange页可以写在form配置的行里
    // if(name === 'test'){
    //   onChange(e, { name: 'test01', value: [value,value] })
    // }
  }

  render(){
    const { entity={} } = this.props;
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="bgWhite pad-mid ">
        <div className="">
          {formRender(entity, this.config(), this.handleChange.bind(this))}
        </div>
        
        <Button className="pull-right blue-btn bottom-btn save-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'))}>保存</Button>
      </div>
      </Page>
    )
  }
}