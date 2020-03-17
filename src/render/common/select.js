import React, { Component } from "react";
import { Row, Col, Button, Input, Table, Select, DatePicker } from 'antd';

export function select({ name, options, width, value='', onChange, onBlur=()=>{}, ...props }){
  const getValue = () => {
    if(value && Object.prototype.toString.call(value) === '[object Object]'){
      return value.value;
    }
    if(Object.prototype.toString.call(value) === '[object Array]'){
      return value.map(v => v.value);
    }
    return value;
  }
  const handleChange = e => {
    // 新增支持多选
    console.log(e);
    if(Object.prototype.toString.call(e) === '[object Array]'){
      let r = e.map(v => options.filter(o=>o.value==v).pop());
      onChange(e, r).then(()=>onBlur({checkedChange:true}));
    }else{
      // 一般对象
      onChange(e, options.filter(o=>o.value==e).pop()).then(()=>onBlur({checkedChange:true}));
    }
  }
  return (
    <Select {...props} value={getValue()} options={options} onChange={handleChange}>
      {options.map(o => <Select.Option key={`${name}-${o.value}`} value={o.value}>{o.label}</Select.Option>)}
    </Select>
  )
}

export function combobox(props){
  return select({...props, showSearch:true, combobox:true, showArrow:false})
}

