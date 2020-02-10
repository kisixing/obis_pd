import React, { Component } from 'react';
import { Select, Button } from 'antd';

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
          {name: 'menzhenNumber[门诊号]', type: 'input', span: 6, valid: 'required'},
          {name: 'zhunshengzheng[准生证号]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'name[姓名]', type: 'input', span: 6, valid: 'required'},
          {name: 'userage[年龄]', type: 'input', span: 6, valid: 'required'},
          {name: 'IDCard[身份证]', type: 'input', span: 6, valid: 'required'}
        ]
      },
      {
        columns: [
          {name: 'userhnation[国籍]', type: 'input', span: 6, valid: 'required'},
          {name: 'userroots[籍贯]', type: 'input', span: 6, valid: 'required'},
          {name: 'userpeople[民族]', type: 'input', span: 6, valid: 'required'}
        ]
      },
      {
        columns: [
          {name: 'danw[工作单位]', type: 'input', span: 6, valid: 'required'},
          {name: 'useroccupation[职业]', type: 'input', span: 6, valid: 'required'},
          {name: 'phone[手机]', type: 'input', span: 6, valid: 'required'}
        ]
      }
    ]
  });
  // 丈夫基本信息
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
          {name: 'menzhenNumber[门诊号]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'name[姓名]', type: 'input', span: 6},
          {name: 'userage[年龄]', type: 'input', span: 6},
          {name: 'IDCard[身份证]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'userhnation[国籍]', type: 'input', span: 6},
          {name: 'userroots[籍贯]', type: 'input', span: 6},
          {name: 'userpeople[民族]', type: 'input', span: 6}
        ]
      },
      {
        columns: [
          {name: 'danw[工作单位]', type: 'input', span: 6},
          {name: 'useroccupation[职业]', type: 'input', span: 6},
          {name: 'phone[手机]', type: 'input', span: 6}
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
      }
    ]
  });
  // 其他信息 -- 户口&现居
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
          {name: 'hk_address[户口地址]', type: 'input', addonBefore: citySelection, placeholder: '请输入详细地址', span: 6, options: hyOptions, valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'jz_address[居住地址]', type: 'input', addonBefore: citySelection,placeholder: '请输入详细地址',span: 6, options: hyOptions, valid: 'required'},
        ]
      }
    ]
  });
  // 孕产历史信息
  pregnancy_history_data = () => ({
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
          {name: 'y[孕次]', type: 'select', span: 6, options: numberOptions,  valid: 'required'},
          {name: 'c[产次]', type: 'select', span: 6, options: numberOptions,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'lastyuejing[末次月经]', type: 'date', span: 6,  valid: 'required'},
          {name: 'pre[预产期]', type: 'date', span: 6,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'yq_weight[孕前体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {name: 'x_weight[现体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {name: 'height[身高](cm)', type: 'input', span: 6,  valid: 'required'},
        ]
      }
    ]
  })



  render() {
    return (
      <Page>
        <div className="bgWhite pad-mid">
          <div>
            {formRender({},this.pregnancy_data_config(),() => console.log('c') )}
          </div>
          <div>
            {formRender({},this.husband_data_config(),() => console.log('c') )}
          </div>
          <div>
            {formRender({},this.other_data_config(),() => console.log('c') )}
          </div>
          <div>
            {formRender({},this.pregnancy_history_data(),() => console.log('c') )}
          </div>
        </div>
        <div className="btn-group pull-right bottom-btn">
          <Button className="blue-btn">重置</Button>
          <Button className="blue-btn">保存</Button>
        </div>
      </Page>
    )
  }
}