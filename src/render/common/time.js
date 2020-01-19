import React,{Component } from 'react';
import { TimePicker } from 'antd';

class MTimePicker extends Component{
  handleChange = (e,value) => {
    const { onChange } = this.props;
    onChange(e,value);
    this.refs.panel.querySelector('input').focus();
  };

  render(){
      const {mode, ...props} = this.props;
      let Wapper = TimePicker;
      // 这里可以判断逻辑
      return (
        <span ref="panel">
          <Wapper {...props} onChange={this.handleChange}/>
        </span>
      )
  }
}

export function time({onChange, onBlur, ...props}){
  const handleChange = (e,value) => {
    onChange(e,value).then(()=>onBlur()) 
  };
  return (
    <MTimePicker {...props} onChange={handleChange}/>
  )
}