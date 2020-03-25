import React, { Component } from "react";
import { Row, Col, Button, Input, Table, Select, DatePicker } from 'antd';

// 新增custom字段，可以用于支持自定义输入
export function select({ name, options, width, value='', tags = false, onChange, onBlur=()=>{}, ...props }){
  console.log(options);
  const getValue = () => {
    if(value && Object.prototype.toString.call(value) === '[object Object]'){
      return value.value;
    }
    // 支持tags后返回不正常
    if(Object.prototype.toString.call(value) === '[object Array]'){
      return value.map(v => v.value);
    }
    return value;
  }
  const handleChange = e => {
    // 新增支持自定义输入值
    // if(tags){
    //   for(let i=0;i<e.length;i++){
    //     if(options.findIndex(v => v.value === e[i]) === -1){
    //       options.push({value:e[i], label:e[i]});
    //       console.log(options);
    //     }
    //   }
    // }
    // 新增支持多选
    if(Object.prototype.toString.call(e) === '[object Array]'){
      let r = e.map(v => options.filter(o=>o.value==v).pop());
      onChange(e, r).then(()=>onBlur({checkedChange:true}));
    }else{
      // 一般对象
      onChange(e, options.filter(o=>o.value==e).pop()).then(()=>onBlur({checkedChange:true}));
    }
  }
  return (
    <Select {...props} value={getValue()} options={options} onChange={handleChange} tags={tags}>
      {options.map(o => <Select.Option key={`${name}-${o.value}`} value={o.value}>{o.label}</Select.Option>)}
    </Select>
  )
}

export function combobox(props){
  return select({...props, showSearch:true, combobox:true, showArrow:false})
}

