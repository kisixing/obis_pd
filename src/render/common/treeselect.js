import React, { Component } from "react";
import { TreeSelect } from 'antd';
  
// 应该要重写

/**
 *  新增 {multiple} 字段      用于支持 多选与单选        default - true
 *  新增 {onlyChildren} 字段  用于支持 父节点不可选中    default - false
 */
export function treeselect({ name, options, width, value='', onChange, onBlur=()=>{}, multiple = true, onlyChildren = false, ...props }){
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
    console.log(label);
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

  const handleSelect = (value, node, event) => {
    // 检测是否为最低一层
    const { props } = node;
    if(onlyChildren && props.child){
      
    }
    console.log(node);
  }

  return (
    <TreeSelect
      treeData={options}
      displayRender={displayRender}
      multiple= {multiple}
      onSelect={handleSelect}
      style={{ width: 200 }}>
    </TreeSelect>
  )
}

