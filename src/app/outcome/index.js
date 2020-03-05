import React, { Component } from "react";
import {Button, Tabs, Collapse} from 'antd';

import { convertString2Json } from './util.js';
import * as baseData from './data';

import service from '../../service/index';
import formRender from '../../render/form';
import Page from "../../render/page";

import "../index.less";
import "./index.less";

const { Panel } = Collapse;
const { TabPane } = Tabs;

const diagnosis_config = () => ({
  step: 1,
  rows: [
    {columns:[{name: 'diagnosis[最后诊断]', type: 'textarea', span: 24}]},
    {columns:[{name: 'followup[产后随访情况]', type: 'textarea', span: 24},]}
  ]
});

const fetus_config = () => ({
  step: 1,
  rows: [
    {
      columns:[
        {name: 'deliveryDate[分娩结果]', type: 'date', span: 6},
        {name: 'deliveryType[分娩方式]', type: 'select', options: baseData.deliveryTypeOptions, span: 6},
        {name: 'chromosome[胎儿染色体]', type: 'select', options: baseData.chromosomeOptions, span: 6},
      ]
    },
    {
      columns:[
        {name: 'sex[新生儿性别]', type: 'select', options: baseData.sexOptions, span: 6},
        {name: 'length[出生身长](cm)', type: 'input', span: 6},
        {name: 'weight[出生体重](kg)', type: 'input', span: 6},
      ]
    },
    {columns:[{name: 'maternalComplication[孕妇并发症]', type: 'checkinput-5', radio: true, options: baseData.ynOptions,span: 24},]},
    {columns:[{name: 'neonatalComplication[新生儿并发症]', type: 'checkinput-5', radio: true, options: baseData.ynOptions, span: 24},]},
    {columns:[{name: 'death[胎儿或新生儿有无死亡]', type: 'checkinput-5', radio: true, options: baseData.ynOptions, span: 24},]},
    {columns:[{name: 'specialRecord[特殊记录]', type: 'textarea', span: 24},]},

  ]
});

/**
 * 在此函数内对value赋值
 * @param obj 赋值对象 NOTICE 一定是对象，不能为数组
 * @param keyStr 路径 形式为 "key1.key2-key3"  .代表对象 -代表数组   如果没有. - 代表第一层
 * @param val value
 */
const OBJECT_SPLIT_KEY = ".";
const ARRAY_SPLIT_KEY = "-";
const mapValueToKey = (obj, keyStr = "", val) => {
  if(keyStr === "") return;
  // check "." "-"
  const objectIndex = keyStr.indexOf(OBJECT_SPLIT_KEY);
  const arrayIndex = keyStr.indexOf(ARRAY_SPLIT_KEY);
  const len = keyStr.length;
  if(objectIndex === -1 && arrayIndex === -1) {
    obj[keyStr] = val;
  }else if(objectIndex < arrayIndex || (objectIndex !== -1 && arrayIndex === -1)){
    const nextKey = keyStr.slice(0,objectIndex);
    if(!obj.hasOwnProperty(nextKey)) {
      obj[nextKey] = {};
    }
    mapValueToKey(obj[nextKey], keyStr.slice(objectIndex+1, len), val);
  }else{
    // 检查到 - ，是数组，try-catch
    const nextKey = keyStr.slice(0,arrayIndex);
    if(Object.prototype.toString.call(obj[nextKey]) !== "[object Array]") {
      obj[nextKey] = [];
    }
    mapValueToKey(obj[nextKey], keyStr.slice(arrayIndex+1, len), val);
  }
};


export default class OutCome extends Component{
  constructor(props) {
    super(props);
    this.state = {
      outComeData: {
        deliveryList: [
          {id: '-1'}
        ]
      }
    }
  }

  componentDidMount() {
    service.outcome.getDeliveryOutcome().then(res => {
      if(res.code === 200 || res.code === "200"){
        res.object['deliveryList'].forEach(fetus => {
          Object.keys(fetus).forEach(key => {
            if(fetus[key].indexOf('{') !== -1 && fetus[key].indexOf('}') !== -1) {
              fetus[key] = convertString2Json(fetus[key]);
            }
          })
        });
        this.setState({outComeData: res.object});
      }
    });
  }

  handleFetusTabEdit = (targetKey, action) => {
    const { outComeData } = this.state;
    if(action === "add") {
      outComeData['deliveryList'].push({});
    }else if(action === "remove"){
      outComeData['deliveryList'].splice(targetKey,1);
    }
    this.setState({outComeData});
  };

  handleFormChange = (path, name, value) => {
    const { outComeData } = this.state;
    if(path === "") {
      mapValueToKey(outComeData,name,value);
    }else{
      mapValueToKey(outComeData,`${path}.${name}`, value);
    }
    this.setState({outComeData});
  };

  handleSave = () => {
    const { outComeData } = this.state;
    console.log(outComeData);
    service.outcome.saveDeliveryOutCome(outComeData).then(res =>{
      console.log(res);
    })
  };
  /* ============================  render ================================= */
  // 渲染 手术操作 胎儿Tab
  renderFetusTabPane = (fetusData) => {
    if(fetusData.length === 0) return null;
    return fetusData.map((v, index) => (
      <TabPane tab={`胎儿${index+1}`} key={index}>{formRender(v, fetus_config(), (_,{name, value}) => this.handleFormChange(`deliveryList-${index}`, name, value))}</TabPane>
    ));
  };


  render() {
    const { outComeData = {} } = this.state;
    const { deliveryList } = outComeData;
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="bgWhite pad-mid ">

              <div>
                {formRender(outComeData,diagnosis_config(),(_,{name, value}) => this.handleFormChange(``, name, value))}
              </div>
            <div>
              <Tabs
                type="editable-card"
                onEdit={this.handleFetusTabEdit}
              >
                {deliveryList && deliveryList.length !== 0 ? (
                  this.renderFetusTabPane(deliveryList)
                ): (<div>暂无信息，点击加号添加</div>)}
                
              </Tabs>
            </div>
        </div>
        <div className="btn-group pull-right bottom-btn">
          <Button className="blue-btn">打印</Button>
          <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
        </div>
      </Page>
    );
  }
}

