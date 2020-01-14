import React, { Component } from "react";
import { Select, Button, Popover, Input, Tabs, Tree, Modal, Icon, Spin,Timeline, Collapse,message } from 'antd';

import tableRender from '../../render/table';
import FuzhenTable from './table';
import Page from '../../render/page';
import service from '../../service';
import * as baseData from './data';
import formRender from '../../render/form';
import * as util from './util';
import editors from '../shouzhen/editors';

import store from '../store';
import { getAlertAction } from '../store/actionCreators.js';

import "../index.less";
import "./index.less";
const { TreeNode } = Tree;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

const coptions = [{
  value: 'genic',
  label: '遗传学检查',
  children: [{
    value: 'chromosome_karyotype',
    label: '染色体核型',
    },
    {
      value: 'chromosomal_microarray',
      label: '染色体微阵列',
    },
    {
      value: 'FISH',
      label: 'FISH',
    }
  ],
}, {
  value: 'infection',
  label: '感染',
  children: [{
    value: 'infection3',
    label: '感染三项DNA/RNA',
  },{
    value: 'infectionlgm',
    label: '感染三项lgm',
  },{
    value: 'infectiongaint',
    label: '巨细胞DNA',
  },{
    value: 'infectionRubella',
    label: '风疹病毒RNA',
  },{
    value: 'infectiontox',
    label: '弓形虫DNA',
  },{
    value: 'infectioncoxsackie',
    label: '柯萨奇病毒RNA',
  },{
    value: 'infectionb19',
    label: 'B19病毒核酸检测',
  }
],
}, {
  value: 'hemolytic_anemia',
  label: '溶血性贫血',
  children: [{
    value: 'hemolytic_anemia1',
    label: '血常规全套',
  },{
    value: 'hemolytic_anemia2',
    label: '血常规五类',
  },{
    value: 'hemolytic_anemia3',
    label: '血型',
  },{
    value: 'hemolytic_anemia4',
    label: '新生儿血清学组合',
  },{
    value: 'hemolytic_anemia5',
    label: '弓形虫DNA',
  },{
    value: 'hemolytic_anemia6',
    label: '直接抗人球蛋白试验',
  },{
    value: 'hemolytic_anemia7',
    label: '肝代谢组合',
  }
],
}, {
  value: 'thalassemia',
  label: '地中海贫血检测',
  children: [{
    value: 'thalassemia1',
    label: '地贫筛查组合',
  },{
    value: 'thalassemia2',
    label: '地中海贫血基因全套',
  },{
    value: 'thalassemia2',
    label: 'α地贫基因检测',
  },{
    value: 'thalassemia3',
    label: 'β地贫基因检测',
  }
],
}, {
  value: 'hydrothorax_ascites',
  label: '胸腹水检查',
  children: [{
    value: 'hydrothorax_ascites1',
    label: '胸腹水全套',
  },{
    value: 'hydrothorax_ascites2',
    label: '胸腹水生化组合',
  },{
    value: 'hydrothorax_ascites3',
    label: '肝代谢组合',
  }
]}, {
  value: 'HF',
  label: '心衰检查',
  children: [{
    value: 'HF1',
    label: '心质组合',
  },{
    value: 'HF2',
    label: '心酶组合',
  },{
    value: 'HF3',
    label: 'BNP',
  }
]}, {
  value: 'other',
  label: '其他检查',
  children: [{
    value: 'other1',
    label: 'AFP',
  },{
    value: 'other2',
    label: '其他',
  }
]}];

const qoptions = [{
  value: 'genic',
  label: '遗传学检查',
  children: [{
    value: 'chromosome_karyotype',
    label: '染色体核型',
    },
    {
      value: 'chromosomal_microarray',
      label: '染色体微阵列',
    },
    {
      value: 'FISH',
      label: 'FISH',
    }
  ],
}, {
  value: 'infection',
  label: '感染',
  children: [{
    value: 'infection3',
    label: '感染三项DNA/RNA',
  },{
    value: 'infectionlgm',
    label: '感染三项lgm',
  },{
    value: 'infectiongaint',
    label: '巨细胞DNA',
  },{
    value: 'infectionRubella',
    label: '风疹病毒RNA',
  },{
    value: 'infectiontox',
    label: '弓形虫DNA',
  },{
    value: 'infectioncoxsackie',
    label: '柯萨奇病毒RNA',
  },{
    value: 'infectionb19',
    label: 'B19病毒核酸检测',
  }
],
}, {
  value: 'hemolytic_anemia',
  label: '溶血性贫血',
  children: [{
    value: 'hemolytic_anemia1',
    label: '血常规全套',
  },{
    value: 'hemolytic_anemia2',
    label: '血常规五类',
  },{
    value: 'hemolytic_anemia3',
    label: '血型',
  },{
    value: 'hemolytic_anemia4',
    label: '新生儿血清学组合',
  },{
    value: 'hemolytic_anemia5',
    label: '弓形虫DNA',
  },{
    value: 'hemolytic_anemia6',
    label: '直接抗人球蛋白试验',
  },{
    value: 'hemolytic_anemia7',
    label: '肝代谢组合',
  }
],
}, {
  value: 'thalassemia',
  label: '地中海贫血检测',
  children: [{
    value: 'thalassemia1',
    label: '地贫筛查组合',
  },{
    value: 'thalassemia2',
    label: '地中海贫血基因全套',
  },{
    value: 'thalassemia2',
    label: 'α地贫基因检测',
  },{
    value: 'thalassemia3',
    label: 'β地贫基因检测',
  }
]
}];

function modal(type, title) {
  message[type](title, 3)
}

export default class Operation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingTable: true,
      loading: true,
      activeElement: '',
      info: {},
      diagnosi: '',
      diagnosis: [],
      diagnosislist: {},
      relatedObj: {},
      recentRvisit: null,
      recentRvisitAll: null,
      recentRvisitShow: false,
      pageCurrent: 1,
      totalRow: 0,
      isShowMoreBtn: false,
      isShowZhenduan: false,
      isMouseIn: false,
      isShowSetModal: false,
      isShowResultModal: false,
      isShowPlanModal: false,
      treatTemp: [],
      templateShow: false,
      collapseActiveKey: ['1', '2', '3'],
      jianyanReport: '血常规、尿常规、肝功、生化、甲功、乙肝、梅毒、艾滋、地贫',
      planData: [],
      modalState: [
        {
          "title": "糖尿病门诊预约",
          "gesmoc": "2019-07-03",
          "options": ["本周五", "下周五","下下周五",""]
        },
        {
          "title": "产前诊断预约",
          "gesmoc": "2019-07-31",
          "options": ["预约1","预约2","预约3"],
          "counts": "3"
        }
      ],
      treeData : [
        {
          title: '2019-12-26',
          key: '0-1',
          children: [
            { title: '羊膜腔穿刺', key: '0-1-0-0' },
            { title: '减胎/毁胎术', key: '0-1-0-1' },
            { title: '其他手术', key: '0-1-0-2' },
          ],
        },
        {
          title: '2020-01-07',
          key: '0-2',
        },
      ],
      selectedKeys: [], 
      panes:[
        { title: '胎儿一', content: '选项卡一内容', key: '1' },
        { title: '胎儿二', content: '选项卡二内容', key: '2' },
      ],     
      activeKey: '1',
    };

    this.componentWillUnmount = editors();
  }

  static Title = '孕妇信息';
  static entityParse(obj = {}){
    return {
      ...obj.gravidaInfo,
      useridtype: JSON.parse(obj.gravidaInfo.useridtype)
    }
  }
  static entitySave(entity = {}){
    return {
      ...entity
    }
  }

   onChange(activeKey) {
    this.setState({ activeKey });
  }
  onEdit(targetKey, action) {
    this[action](targetKey);
  }
  add() {
    const panes = this.state.panes;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: '新建页签', content: '新页面', key: activeKey });
    this.setState({ panes, activeKey });
  }
  remove(targetKey) {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  }
  configpreoperative_record(){
    return {
      step: 1,
        rows: [
        {
          columns: [
            { name: 'operation_date[手术日期]', type: 'date', span: 5, valid: 'required'},
            {span: 1},
            { name: 'temperature[体@@@温 ]', type: 'date', span: 5, valid: 'required'},
            {span: 1},
            { name: 'ckpressure(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 5, valid: (value)=>{
              let message = '';
              if(value){
                message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
              }else{
                message = valid('required',value)
              }
              return message;
            }},
          ]
        },
      ]
    }
  }
  configinspection_item() {
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'amniotic_fluid[羊水]', type: 'cascader', options:coptions, span: 16 },
            { name: 'umbilical_blood[脐血]', type: 'cascader', options:coptions, span: 16 },
            { name: 'villus[绒毛]', type: 'cascader', options:qoptions, span: 16 }
          ]
        },     
      ]
    };
  }

  configbs(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'treatment2[现病史]', type: 'textarea', span: 16 },
            { name:'treatment2[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: this.handleTreatmentClick.bind(this)}
          ]
        }
      ]
    }
  }

  configoperative_procedure(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'operation_items[手术项目]',  type: 'checkinput', radio: true, options: baseData.operation_itemsOptions, span: 24},
          ]
        },
        {
          columns:[
            { name: 'exception[手术编号]', type: 'input', span: 4 },
          ]
        },
        {
          columns:[
            { name: 'operator[术者]', type: 'select', showSearch: true, options: baseData.operaterOptions, valid: 'required',span: 4 },
            { name: 'assistant[助手]', type: 'select', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4},
            { name: 'start_time[开始时间]', type: 'date', valid: 'required',span: 4},
            { name: 'end_time[结束时间]', type: 'date', valid: 'required',span: 4},
          ]
        },
        {
          columns:[
            { name: 'duration(min)[持续时间]', type: 'input', valid: 'required',span: 4 }
          ]
        },
        {
          columns:[
            { name: 'uterus[子宫]', type: 'select', showSearch: true, options: baseData.uterusOptions, valid: 'required',span: 4},
            { name: 'method[方法]', type: 'select', options: baseData.methodOptions, valid: 'required',span: 4},
            { name: 'placenta[胎盘]', type: 'select', options: baseData.placentaOptions, valid: 'required',span: 4},
            { name: 'instrument[器械]', type: 'select', options: baseData.instrumentOptions, valid: 'required',span: 4}
          ]
        },
        {
          columns:[
            { name: 'specimen_location[取样位置]', type: 'select', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4},           
            { name: 'count[进入宫腔次数]', type: 'select', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4},
            { name: 'specimen_amount(ml)[标本]', type: 'input', showSearch: true, valid: 'required',span: 4},
            { name: 'character[性状]', type: 'select', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4},
          ]
        },
        {
          columns:[
            { name: 'process_evaluation[过程评估]', type: 'checkinput', radio: true, options: baseData.statusOptions, valid: 'required',span: 16}
          ]
        },
        {
          columns:[
            { name: 'process_evaluation[术中特殊]', type: 'textarea',span: 20}
          ]
        },
        {
          columns:[
            { name: 'pre_fhr(bpm)[术前胎心率]', type: 'input', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4},
            { name: 'after_fhr(bpm)[术后胎心率]', type: 'input', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 4}
          ]
        },
        {
          columns:[
            { name: 'diagnosis[诊断]', type: 'textarea', valid: 'required',span: 20}
          ]
        },
        {
          columns:[
            { name: 're_puncture[是否再次穿刺]', type: 'checkinput', showSearch: true, options: baseData.yesOptions, valid: 'required',span: 4}
          ]
        },
      ]
    }
  }
  configdoctors_advice(){
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'doctor_advice[术后医嘱]', type: 'textarea', span: 16 },
          ]
        }
      ]
      }
    }
    configbase(){
      return {
        step: 1,
        rows: [
          {
            label: '早孕超声:', span: 12, className:'labelclass2'
          },
          {
            columns:[
              { name: 'diagnosis(周)[停经]', type: 'input', span: 4 },
            ]
          },
        ]
        }
      }
  handleChange(e, { name, value, target }){
    const { onChange } = this.props;
    onChange(e, { name, value, target })
    // 关联变动请按如下方式写，这些onChange页可以写在form配置的行里
    // if(name === 'test'){
    //   onChange(e, { name: 'test01', value: [value,value] })
    // }
  }

  handleTreatmentClick(e, {text,index},resolve){
    const { modalState, modalData } = this.state;
    text==='更多'?this.setState({openTemplate:resolve}):this.addTreatment(e, text);
    if(text==='糖尿病日间门诊') {
      this.setState({modalData: modalState[0]}, () => {
        this.setState({openYy: true});
      })
    }else if (text==='产前诊断') {
      this.setState({modalData: modalState[1]}, () => {
        this.setState({openYy: true});
      })
    }
  }

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} dataRef={item} />;
    });

    renderKTreeNode = data => {
      return data.map(item => {
        if (item.child) {
          return (
            <TreeNode title={item.menu_name} key={item.menu_id} appId={item.app_id} dataRef={item}>
              {this.renderKTreeNode(item.child)}
            </TreeNode>
          );
        }
  
        return <TreeNode title={item.menu_name} key={item.menu_code} dataRef={item}/>;
      });
    };
  
    // 选中节点触发-------如何在这里获取到选中节点的app_id？？？
    onSelect = (selectedKeys) => {
      console.log(selectedKeys);
      if (selectedKeys.length > 0) {
        // 防止编辑时重复点击造成选中节点为空
        this.setState({
          selectedKeys,
        });
      }
    };
  renderLeft() {
    const { planData, collapseActiveKey } = this.state;

    return (
      <div className="fuzhen-left ant-col-5">
        <Collapse defaultActiveKey={collapseActiveKey}>
          <Panel header="" key="3">
            <Timeline className="pad-small" pending={planData.length>0 ? <Button type="ghost" size="small" onClick={() => this.setState({isShowPlanModal: true})}>管理</Button> : null}>
              {planData.length>0 ? planData.map((item, index) => (
                <Timeline.Item key={`planData-${item.id || index}-${Date.now()}`}>
                  <p className="font-16">{item.time}周后 - {item.gestation}孕周</p>
                  <p className="font-16">{item.event}</p>
                </Timeline.Item>
              ))
                : <div>无</div>}
            </Timeline>
          </Panel>
        </Collapse>
      </div>
    );
  }

  render(){
    const { entity={} } = this.props;
    console.log(this.state.treeData,entity);
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="fuzhen-left ant-col-5">
        <Tree
        onSelect={this.onSelect}
        defaultExpandAll = {true}
        >    
        { this.renderTreeNodes(this.state.treeData)}
        </Tree>
        </div>
        {/* <div className="fuzhen-left ant-col-5">
        <Tree
          showLine={true}
          showIcon={false}
          defaultExpandedKeys={['0-0-0', '0-0-1', '0-0-2']}
        >
          <TreeNode icon={<Icon type="carry-out" />} title="parent 1" key="0-0">
            <TreeNode icon={<Icon type="carry-out" />} title="parent 1-0" key="0-0-0">
              <TreeNode icon={<Icon type="carry-out" />} title="leaf" key="0-0-0-0" />
              <TreeNode icon={<Icon type="carry-out" />} title="leaf" key="0-0-0-1" />
              <TreeNode icon={<Icon type="carry-out" />} title="leaf" key="0-0-0-2" />
            </TreeNode>
            <TreeNode icon={<Icon type="carry-out" />} title="parent 1-1" key="0-0-1">
              <TreeNode icon={<Icon type="carry-out" />} title="leaf" key="0-0-1-0" />
            </TreeNode>
            <TreeNode icon={<Icon type="carry-out" />} title="parent 1-2" key="0-0-2">
              <TreeNode icon={<Icon type="carry-out" />} title="leaf" key="0-0-2-0" />
              <TreeNode
                switcherIcon={<Icon type="form" />}
                icon={<Icon type="carry-out" />}
                title="leaf"
                key="0-0-2-1"
              />
            </TreeNode>
          </TreeNode>
        </Tree>
        </div> */}
        <div className="fuzhen-right ant-col-19 main-pad-small width_7">
        <Collapse defaultActiveKey={['1','2','3','4','5','6','7']} >
          <Panel header="术前记录" key="1">
            {formRender(entity, this.configpreoperative_record(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="手术操作" key="2" extra="">
            <Tabs
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            >
              {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{formRender(entity, this.configoperative_procedure(), this.handleChange.bind(this))}</TabPane>)}
            </Tabs>
          </Panel>
          <Panel header="送检项目" key="3">
            <Tabs
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            >
              {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{formRender(entity, this.configinspection_item(), this.handleChange.bind(this))}</TabPane>)}
            </Tabs>
          </Panel>
          <div className="single">{formRender(entity, this.configdoctors_advice(), this.handleChange.bind(this))}</div>
        </Collapse>
        <Button className="pull-right blue-btn bottom-btn save-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'))}>保存</Button>
        <Button className="pull-right blue-btn bottom-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'), "open")}>保存并开立医嘱</Button>
        </div>
      </Page>
    )
  }
}