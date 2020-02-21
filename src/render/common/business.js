import React,{Component} from 'react';
import { Input, Select } from 'antd';
// 业务组件
const { Option } = Select;
// class pharmacyinput extends Component {
//   constructor(props) {
//     super(props);
//   }
//
//   render() {
//     return ()
//   }
// }
export function pharacyinput(props) {
  const { name, entity,onChange, onBlur } = props;
  let data = {drugName: '', drugVolume: ''};
  // 设置初始值
  if(entity[name]){
    data.drugName = entity[name].split("|")[0] || "";
    data.drugVolume = entity[name].split("|")[1] || "";
  }
  // 回调
  const handleNameChange = (event) => {
    const { value } = event.target;
    data.drugName = value;
    onChange(event, `${data.drugName}|${data.drugVolume}`).then(() => onBlur({checkedChange:true}));
  };
  const handleVolumeChange = (event) => {
    const { value } = event.target;
    data.drugName = value;
    onChange(event, `${data.drugName}|${data.drugVolume}`).then(() => onBlur({checkedChange:true}));
  };

  return (
    <div style={{display: 'flex'}}>
      <Input
        addonBefore='药物名称'
        value={data.drugName}
        onChange={(e) => handleNameChange(e)}
      />
      <Input
        addonBefore='用药量'
        value={data.drugVolume}
        onChange={(e) => handleVolumeChange(e)}
        addonAfter='mg'
      />
    </div>
  )
}

// TODO 可能有一点问题，下午排查
export function hemorrhageselect(props) {
  const { name, entity, onChange, onBlur } = props;

  let data = {label:'有', value:''};
  // 设置初始值
  if(entity[name]){
    console.log(entity);
    data.label = entity[name].label;
    data.value = entity[name].value;
  }

  // 回调
  const handleChange = (key,value,event) => {
    data[key] = value;
    onChange(event, data).then(() => onBlur({checkedChange:true}));
  };

  return (
    <Select value={data.label} onSelect={(value,event) => handleChange('label',value, event)}>
      <Option value="有">
        <div style={{display: 'flex'}}>
          <div><span>有</span></div> <Input value={data.value} onChange={(e) => handleChange('value', e.target.value, e)} addonAfter="s"/>
        </div>
      </Option>
      <Option value="无">无</Option>
    </Select>
  )
}
