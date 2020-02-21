import React, {Component} from "react";
import {TreeSelect} from 'antd';

/*
* 2020-02-04 为 props 属性添加 isSelectParent 用于禁用父节点的选择
*   handleChange() need to check the `isLeaf` props
*/
function editOptions(arr, isSelectParent = false) {
  if(arr instanceof Array) {
    arr.forEach(item => {
      // 为key赋值
      item.key = item.value;
      if(item.children) {
        item['isLeaf'] = isSelectParent;
        editOptions(item.children);
      }else{
        item['isLeaf'] = !isSelectParent;
      }
    })
  }else {
    console.error(`expect Array but ${Object.prototype.toString.call(arr)}`);
  }
  return arr;
}

class MyTreeSelect extends Component{
  constructor(props) {
    super(props);
    this.state = {
      currentValue: [],
      nOptions: []
    }
  }

  componentDidMount() {
    const { value, isSelectParent, options }  = this.props['mProps'];
    const { currentValue } = this.state;
    const type = Object.prototype.toString.call(value);
    // 设置初始值
    if(type === `[object Object]`) {
      currentValue.push(value);
      this.setState({currentValue});
    }else if(type === `[object Array]`){
      this.setState({currentValue: value})
    }else {
      console.warn(`expect object/array but ${type},setting treeselect's value to empty Array`);
      this.setState({currentValue: []});
    }
    // 设置nOption
    let nOptions = editOptions(options, isSelectParent);
    this.setState({nOptions});
  }

  handleChange = (_,__,event) => {
    // 清除
    const { currentValue } = this.state;
    const { onChange, onBlur } = this.props['mProps'];
    if(event.clear) {
      const { triggerValue } = event;
      let i = currentValue.findIndex((element) => {
        return element === triggerValue;
      });
      currentValue.splice(i,1);
      this.setState({currentValue}, () => onChange(event, currentValue).then(()=>onBlur({checkedChange:true})));
    }else if(event.selected) {
      const { isSelectParent } = this.props['mProps'];
      const { props } = event['triggerNode'];
      const { currentValue } = this.state;
      if(isSelectParent || props.children === undefined){
        // 暂时这样写
        currentValue.push({value:event['triggerValue'],label:event['triggerValue']});
        this.setState({currentValue}, () => onChange(event, currentValue).then(()=>onBlur({checkedChange:true})));
      }else{
        console.log('父节点,不可选');
      }
    }
  }

  render() {
    const { multiple = true, isSelectParent = false } = this.props['mProps'];
    const { nOptions = [] ,currentValue = [] } = this.state;
    // 以后考虑移到别的地方
    const currentSelections = currentValue.map(v => (v.label));
    return (
      <TreeSelect
        value={currentSelections}
        treeData={nOptions}
        multiple={multiple}
        style={{width: 200}}
        onChange={this.handleChange}
      />
    )
  }

}

// 参数有两层props
export function treeselect(props) {
  return (<MyTreeSelect mProps={props}/>)
}
