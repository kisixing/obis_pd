import React, { Component } from "react";
import { TreeSelect } from 'antd';

export function treeselect({ name, options, width, value='', onChange, onBlur=()=>{}, ...props }){
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
    <TreeSelect
    treeData={options}
    displayRender={displayRender}
    multiple= {true}
    style={{ width: 200 }}>
    </TreeSelect>
  )
}

