import React,{Component} from 'react';
import { Input, Select } from 'antd';
import { newDataTemplate } from '../../app/medicalrecord/data';
// 业务组件
const { Option } = Select;

// 是否药物 延申
export function pharacyinput(props) {
  const { name, entity, onChange, value, onBlur } = props;
  let targetData = value.split('|') || "";
  const handleChangeName = (e) => {
    if (targetData[0] !== e.target.value) {
      if (onChange) {
        targetData[0] = e.target.value;
        onChange(e, `${targetData[0]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };
  const handleChangeVolume = (e) => {
    if (targetData[1] !== e.target.value) {
      if (onChange) {
        targetData[1] = e.target.value;
        onChange(e, `${targetData[0]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };

  return (
    <div style={{display: 'flex'}}>
      <span>（药物名称：</span>
      <Input  defaultValue={targetData[0] || ""} onChange={handleChangeName}/>
      <span>，</span>
      <span>用药量：</span>
      <Input  defaultValue={targetData[1] || ""} onChange={handleChangeVolume}/>
      <span>mg）</span>
    </div>
  )
}

// 流血时间/原因input
export function bloodinput(props) {
  const { name, entity, onChange, value, onBlur } = props;
  let targetData = value.split('|') || "";
  const handleChangeName = (e) => {
    if (targetData[0] !== e.target.value) {
      if (onChange) {
        targetData[0] = e.target.value;
        onChange(e, `${targetData[0]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };
  const handleChangeVolume = (e) => {
    if (targetData[1] !== e.target.value) {
      if (onChange) {
        targetData[1] = e.target.value;
        onChange(e, `${targetData[0]}|${targetData[1]}`).then(() => onBlur({checkedChange: true}));
      } else {
        console.log('miss onChange: ' + props.name);
      }
    }
  };

  return (
    <div style={{display: 'flex'}}>
      <span>（时间：</span>
      <Input  defaultValue={targetData[0] || ""} onChange={handleChangeName}/>
      <span>，</span>
      <span>原因：</span>
      <Input  defaultValue={targetData[1] || ""} onChange={handleChangeVolume}/>
      <span>）</span>
    </div>
  )
}


class HemorrhageSelect extends Component{
  constructor(props){
    super(props);
    this.state = {
      data:{
        label:"",value:""
      }
    }
  }
  componentDidMount(){
    const { entity } = this.props;
    this.mapPropsToState();
  }
  componentDidUpdate(prevProps){
    const {name,entity} = this.props;
    if(JSON.stringify(entity[name]) !== JSON.stringify(prevProps.entity[prevProps.name])){
      this.mapPropsToState();
    }
  }
  mapPropsToState = () => {
    const {name, entity} = this.props;
    const d = entity[name] || {value: "", label: ""};
    this.setState({data:d});
  }
  handleSelect = (val,e) => {
    if(val === "无"){
      this.setState({data: {label: "无",value: ""}},() => this.emit(e));
    }else if(val === "有"){
      this.setState({data: {label: "有",value: ""}},() => this.emit(e));
    }
  }
  handleInput = (e) => {
    const { label } = this.state.data;
    this.setState({data: {label,value: e.target.value}},() => this.emit(e));
  }
  emit = (event) => {
    const { data } = this.state;
    const { onChange, onBlur} = this.props;
    onChange(event, data).then(() => onBlur({checkedChange: true}));
  }
  render(){
    const defaultOption = [
      {value: "有", label: "有"},
      {value: "无", label: "无"},
    ]
    const { data} = this.state;
    return(
      <div style={{display: "flex"}}>
        <Select 
          value={data.label} 
          onSelect={(value,event) => this.handleSelect(value, event)}  
        >
          {defaultOption.map((v,index) => <Option value={v.value} key={index}>{v.label}</Option>)}
        </Select>
        {data.label === "有" ? 
          <Input
            value={this.state.data.value || ""}
            onChange={this.handleInput}
          /> 
          : null}
      </div>
    )
  }
}

// 出血类select
export function hemorrhageselect(props) {
  return <HemorrhageSelect {...props} />
}

// 是否流血
export function whetherbleedingselect(props) {
  const { name, entity, onChange, onBlur } = props;

  var uValue = '';
  
  // 设置初始值
  if(entity[name]){
    uValue = entity[name].value;
  }

  // 回调
  const handleSelect = (value,event) => {
    uValue = value;
    onChange(event, uValue).then(() => onBlur({checkedChange:true}));
  };

  return (
    <div>
      <span>出血量:</span>
      <Select onSelect={(value,event) => handleSelect(value, event)}>
        <Option value="+">+</Option>
        <Option value="++">++</Option>
      </Select>
    </div>
    
  )
}

