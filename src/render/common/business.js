import React,{Component} from 'react';
import { Input, Select } from 'antd';
// 业务组件
const { Option } = Select;

// 中文输入法有问题
export function pharacyinput(props) {
  const { name, entity, onChange, value, onBlur } = props;
  let targetData = value.split('|') || "";
  const handleChangeName = (e) => {
    if (targetData[0] !== e.target.value) {
      if (onChange) {
        targetData[0] = e.target.value;
        onChange(e, `${targetData[0]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };
  const handleChangeVolume = (e) => {
    if (targetData[1] !== e.target.value) {
      if (onChange) {
        targetData[1] = e.target.value;
        onChange(e, `${targetData[1]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };

  return (
    <div style={{display: 'flex'}}>
      <span>（药物名称：</span>
      <Input  defaultValue={targetData[0] || ""} onChange={handleChangeName}/>
      <span>，</span>
      <span>用药量：</span>
      <Input  defaultValue={targetData[1] || ""} onChange={handleChangeVolume}/>
      <span>mg）</span>
    </div>
  )
}

// TODO 可能有一点问题，下午排查
export function hemorrhageselect(props) {
  const { name, entity, onChange, onBlur } = props;

  let data = {label:'有', value:''};
  // 设置初始值
  if(entity[name]){
    // console.log(entity);
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
