import React, { Component } from "react";
import { Select } from 'antd';
class MySelect extends Component{
  constructor(props){
    super(props);
    this.state = {
      options: [],
      value: [],
      isEnd: false
    };
  }


  componentDidMount() {
    const { options } = this.props;
    this.setState({options: options})
  }

  handleSearch = (val) => {
    // 这个位置延时一下，确保onCompositionEnd在这一个方法后触发
    setTimeout(() => {
      if(!this.state.isEnd) return;
      const {custom,tags} = this.props;
      this.setState((state) => {
        // 仅在custom与tags模式下才可以自定义输入
        if(!state.options.find(o => o.value === val) && (custom || tags)){
          state.options.push({label:val,value:val});
        }
        return state;
      })
    }, 200)
  }

  handleChange = (val) => {
    if(Object.prototype.toString.call(val) === '[object Array]'){
      this.setState({value:val},() => {
        const { onChange, onBlur } = this.props;
        const { options } = this.state;
        const res = val.map(v => options.find(o => o.value === v));
        onChange('event', res).then(() => onBlur({checkedChange:true}));
      });
    }else{
      // 单选
      this.setState({value:val},() => {
        const { onChange, onBlur } = this.props;
        const { options } = this.state;
        // 这个event是空的
        onChange('event', {label: val, vale: val}).then(() => onBlur({checkedChange:true}));
      });
    }
    
  }
  render() {
    const { options, value } = this.state;
    return (
      <div 
        onCompositionStart={() => this.setState({isEnd: false})}
        onCompositionEnd={() => this.setState({isEnd: true})}
      >
        <Select
        {...this.props} 
        value={value} 
        options={options} 
        onChange={this.handleChange} 
        onSearch={this.handleSearch} 
        ref="mySelect"
      >
        {options.map(o => <Select.Option key={`${name}-${o.value}`} value={o.value}>{o.label}</Select.Option>)}
      </Select>
      </div> 
    )
  }
}

export function select(props) {
  return <MySelect {...props}/>
}