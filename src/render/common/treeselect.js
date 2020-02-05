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
}

class MyTreeSelect extends Component{
  constructor(props) {
    super(props);
    this.state = {
      currentValue: []
    }
    console.log(props);
  }

  componentDidMount() {
    const { value }  = this.props['mProps'];
    const type = Object.prototype.toString.call(value);
    if(type === `[object Object]`) {
      this.setState({currentValue: value['value'] });
    }else if(type === `[object Array]`){
      this.setState({currentValue: value})
    }else {
      console.error(`expect object/array but ${type}`);
    }
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
        currentValue.push(props.value);
        this.setState({currentValue}, () => onChange(event, currentValue).then(()=>onBlur({checkedChange:true})));
      }else{
        console.log('父节点,不可选');
      }
    }
    // console.log(currentValue);
    // onChange(event, currentValue).then(()=>onBlur({checkedChange:true}));
  }

  render() {
    const { options, multiple = true, isSelectParent } = this.props['mProps'];
    const { currentValue } = this.state;
    let nOption = [];
    options.forEach(v => {
      nOption.push(Object.assign({},v));
    });
    editOptions(nOption, isSelectParent);
    return (
      <TreeSelect
        value={currentValue}
        treeData={nOption}
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