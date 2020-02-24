import React, { Component } from "react";
import { Select, Button, Popover, Input, Tabs, Tree, Modal, Icon, Spin, Timeline, Collapse, message } from 'antd';

import * as baseData from './data';
import service from '../../service/index';
import formRender from '../../render/form';

import "../index.less";
import "./index.less";
import Page from "../../render/page";

const Panel = Collapse.Panel;

const diagnosis_config = () => ({
  step: 1,
  rows: [
    {columns:[{name: 'diagnosis[最后诊断]', type: 'textarea', span: 24}]},
    {columns:[{name: 'followup[产后随访情况]', type: 'textarea', span: 24},]}
  ]
});

console.log(baseData.ynOptions);

const fetus_config = () => ({
  step: 1,
  rows: [
    {
      columns:[
        {name: 'deliveryDate[分娩结果]', type: 'date', span: 6},
        {name: 'deliveryType[分娩方式]', type: 'select', options: baseData.deliveryTypeOptions, ßspan: 6},
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
    {columns:[{name: 'maternalComplication[孕妇并发症]', type: 'checkinput', options: baseData.ynOptions,span: 24},]},
    {columns:[{name: 'neonatalComplication[新生儿并发症]', type: 'checkinput',options: baseData.ynOptions, span: 24},]},
    {columns:[{name: 'death[胎儿或新生儿有无死亡]', type: 'checkinput',options: baseData.ynOptions, span: 24},]},
    {columns:[{name: 'specialRecord[特殊记录]', type: 'textarea', span: 24},]},

  ]
})

export default class OutCome extends Component{
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    service.outcome.getDeliveryOutcome().then(res => {console.log(res)});
  }

  render() {
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="bgWhite pad-mid ">
          {formRender({},diagnosis_config(),() => console.log('e'))}
          {formRender({},fetus_config(),() => console.log('e'))}
        </div>
      </Page>
    );
  }
}

