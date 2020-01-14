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

  const handleChange = e => {
    onChange(e, options.filter(o=>o.value==e).pop()).then(()=>onBlur({checkedChange:true}));
  }

  return (
    <Cascader
    options={options}
    defaultValue={['zhejiang', 'hangzhou', 'xihu']}
    displayRender={displayRender}
    style={{ width: 200 }}>
    </Cascader>
  )
}

