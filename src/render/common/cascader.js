import React, { Component } from "react";
import { Cascader } from 'antd';

export function cascader({ name, options, width, value='', onChange, onBlur=()=>{}, ...props }){
  const getValue = () => {
    if(value && typeof value === 'object'){
      return value.value;
    }
    return value;
  }
  
  function handleAreaClick(e, label, option) {
    e.stopPropagation();
    console.log('点击了', label, option);
  }
  
  const displayRender = (labels, selectedOptions) => labels.map((label, i) => {
    const option = selectedOptions[i];
    if (i === labels.length - 1) {
      return (
        <span key={option.value}>
          {label} <a onClick={(e) => handleAreaClick(e, label, option)}>{option.code}</a>
        </span>
      );
    }
    return <span key={option.value}>{label} / </span>;
  });

  const handleChange = (value, selectedOptions) => {
    let valStr = "";
    value.forEach(v => valStr += `${v}/`);
    valStr = valStr.substring(0,valStr.length-1);
    onChange("不可获取e", valStr).then(()=>onBlur({checkedChange:true}));
  }

  return (
    <Cascader
      options={options}
      defaultValue={['zhejiang', 'hangzhou', 'xihu']}
      displayRender={displayRender}
      style={{ width: 200 }}
      onChange={handleChange}
      >
    </Cascader>
  )
}

