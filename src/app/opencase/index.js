import React, { Component } from 'react';
import { Select, Button, message } from 'antd';

import service from '../../service/index.js';

import formRender from '../../render/form';
import Page from '../../render/page';

import "../index.less";

import { hyOptions, numberOptions } from './data.js';

const { Option } = Select;
// TODO 三级城市选择器 -- 未完成
const citySelection = (
  <Select placeholder='请选择' style={{width: 70}}>
    <Option value="北京">北京</Option>
    <Option value="上海">上海</Option>
    <Option value="广州">广州</Option>
  </Select>
)

export default class OpenCase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pregnancyData: {
        ADD_FIELD_husband_useridtype: {"label":"身份证","value":"身份证"}
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
    rows: [
      {
        columns: [
          { label: '孕妇信息', span: 12  }
        ]
      },
      {
        columns: [
          {name: 'usermcno[门诊号]', type: 'input', span: 6, valid: 'required'},
          {name: 'zhunshengzheng[准生证号]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'username[姓名]', type: 'input', span: 6, valid: 'required'},
          {name: 'userage[年龄]', type: 'input', span: 6, valid: 'required'},
          {name: 'useridno[身份证]', type: 'input', span: 6, valid: 'required'}
        ]
      },
      {
        columns: [
          {name: 'usernation[国籍]', type: 'input', span: 6, valid: 'required'},
          {name: 'userroots[籍贯]', type: 'input', span: 6, valid: 'required'},
          {name: 'userpeople[民族]', type: 'input', span: 6, valid: 'required'}
        ]
      },
      {
        columns: [
          // new
          // {name: 'danw[工作单位]', type: 'input', span: 6, valid: 'required'},
          {name: 'useroccupation[职业]', type: 'input', span: 6},
          {name: 'usermobile[手机]', type: 'input', span: 6, valid: 'required'}
        ]
      },
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
          {name: 'userhage[年龄]', type: 'input', span: 6},
          {name: 'userhidno[身份证]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'userhnation[国籍]', type: 'input', span: 6},
          {name: 'userhroots[籍贯]', type: 'input', span: 6},
          {name: 'userhpeople[民族]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          // {name: 'danw[工作单位]', type: 'input', span: 6},
          {name: 'userhoccupation[职业]', type: 'input', span: 6},
          {name: 'userhmobile[手机]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          { name: 'add_FIELD_husband_smoking(支/天)[抽烟]', type: 'input', span: 6 },
          { name: 'add_FIELD_husband_drinking(毫升/日)[抽烟]', type: 'input', span: 6 },
        ]
      },
      {
        columns: [
          { name: 'userhjib[现有何病]', type: 'input', span: 12 }
        ]
      },
      {
        columns: [
          {label: '其他信息', span: 12}
        ]
      },
      {
        columns: [
          // TODO 这里缺少 地级市 级联选择器
          {name: 'useraddress[户口地址]', type: 'input', addonBefore: citySelection, placeholder: '请输入详细地址', span: 12, options: hyOptions},
        ]
      },
      {
        columns: [
          {name: 'userconstant[居住地址]', type: 'input', addonBefore: citySelection,placeholder: '请输入详细地址',span: 12, options: hyOptions},
        ]
      }
    ]
  });

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
          {name: 'chanc[产次]', value: 0, type: 'select', span: 6, options: numberOptions,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'gesmoc[末次月经]', type: 'date', span: 6,  valid: 'required'},
          {name: 'gesexpect[预产期]', type: 'date', span: 6,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'cktizh[孕前体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {name: 'ckcurtizh[现体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {name: 'cksheng[身高](cm)', type: 'input', span: 6,  valid: 'required'},
        ]
      }
    ]
  });


  /* ======================= handler =============================== */
  handlePregnancyChange = (_,{name,value}) => {
    const { pregnancyData } = this.state;
    pregnancyData[name] = value;
    this.setState({pregnancyData});
  };
  handleBenYunChange = (_,{name,value}) => {
    const { benYunData } = this.state;
    benYunData[name] = value;
    this.setState({benYunData});
  };
  //
  handleSave = () => {
    const { pregnancyData, benYunData } = this.state;
    service.opencase.addyc({...pregnancyData, ...benYunData}).then(res => {
      message.success(`成功建册，userid为${res.id}，输入门诊号切换孕妇`);
      // 新建了一个id，设置到
      // const userid = res.id;

    });
    service.opencase.useryc({...pregnancyData, ...benYunData}).then(res => {
      console.log(res);
    });
  };


  render() {
    console.log(this.state);
    const { pregnancyData, benYunData } = this.state;
    return (
      <Page>
        <div className="bgWhite pad-mid">
          <div>
            {formRender(pregnancyData,this.pregnancy_data_config(), this.handlePregnancyChange)}
          </div>
          <div>
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
