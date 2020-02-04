import React, { Component } from "react";
import { Select, Button, Popover, Input, Tabs, Tree, Modal, Row,Col, Spin,Timeline, Collapse,message } from 'antd';

import axios from 'axios';

import {valid} from '../../render/common';
import Page from '../../render/page';
import service from '../../service';
import * as baseData from './data';
import formRender from '../../render/form';
import * as util from './util';
import editors from '../shouzhen/editors';

import EditableTable from '../medicalrecord/editableTable.js';

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
    value: 'thalassemia3',
    label: 'α地贫基因检测',
  },{
    value: 'thalassemia4',
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
    value: 'thalassemia3',
    label: 'α地贫基因检测',
  },{
    value: 'thalassemia4',
    label: 'β地贫基因检测',
  }
]
}];

function modal(type, title) {
  message[type](title, 3)
}

const TEMPLATE_KEY = {
  zz: 'dmr1', xb: 'dmr2', qt: 'dmr3', zd: 'dmr4', cl: 'dmr5'
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
      treeData : [],
      selectedKeys: [], 
      panes:[
        { title: '胎儿1', content: '选项卡一内容', key: '0' },
      ],
      ipanes:[
        { title: '胎儿1', content: '选项卡一内容', key: '0' },
      ],
      activeKey: 'fetus-0',
      iactiveKey :'ifetus-0',

       /**
       * @param
       * {isShowTemplateModal} - modal框
       * {type} - template type
       * {templateList} - templateList from server
       */
      templateObj: { 
        isShowTemplateModal: false,
        type: '', 
        templateList: []
      },
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

  componentDidMount() {
    const {} = this.state;
    Promise.all([
    service.getoperationdetail().then(res => {
      let currentpanes = res['object']['operative_procedure'].fetus;
      let currentipanes = res['object']['inspection_item'].fetus;
      currentpanes.forEach((pane, i) => {
        pane.key = "fetus-"+i;
        // 为 送检项目 提供render属性
        pane['operation_items'].forEach(item => {
          switch (item.value) {
            case '绒毛活检':
              Object.assign(currentipanes[i]['villus'],{render: true});
              break;
            case '羊膜腔穿刺':
              Object.assign(currentipanes[i]['amniotic_fluid'],{render: true});
              break;
            case '脐带穿刺':
              Object.assign(currentipanes[i]['umbilical_blood'],{render: true});
              break;
          }
        })
      });
      currentipanes.forEach((pane, i) => {
        pane.key = "ifetus-"+i;
      });
      this.setState({ entity: res['object'], panes:currentpanes, ipanes:currentipanes});
      // console.log(this.state);
    })])
  }

  // 展示使用
  getOperationDetail = (key) => {
    service.getoperationdetail().then(res => {
      console.log(res);
      let currentpanes = res.object.operative_procedure.fetus;
      let currentipanes = res.object.inspection_item.fetus;
      currentpanes.forEach((pane, i) => {pane.key = "fetus-"+i;});
      currentipanes.forEach((pane, i) => {pane.key = "ifetus-"+i;});
      this.setState({ entity: res.object,panes:currentpanes,ipanes:currentipanes});
      // console.log(this.state);
      // 记录手术项目
      console.log(res);
    })
  }
  

  onTabChange=(activeKey) =>{
    console.log(activeKey);
    this.setState({
      activeKey
    });    
  }
  ontabEdit=(targetKey, action)=> {
    //this[action](targetKey);
    if(action==='add'){
      this.addtab();
    }else if(action ==='remove'){
      this.remove(targetKey);
    }
  }
  addtab() {
    const panes = this.state.panes;
    const activeKey = panes.length;
    panes.push({key: "fetus-"+activeKey});
    this.setState({ panes, activeKey });
  }
  remove(targetKey) {
    //TODO: 删除提示
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    let panes = this.state.panes.filter(pane => pane.key !== targetKey);
    panes.forEach((pane, i) => {
      pane.key = "fetus-"+i;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  }
  oninspectionChange=(activeKey) =>{
    console.log(activeKey);
    this.setState({
      iactiveKey:activeKey
    });    
  }
  oninspectionEdit=(targetKey, action)=> {
    //this[action](targetKey);
    if(action==='add'){
      this.addinspection();
    }else if(action ==='remove'){
      this.removeinspection(targetKey);
    }
  }
  addinspection() {
    const ipanes = this.state.ipanes;
    const activeKey = ipanes.length;
    ipanes.push({key: "ifetus-"+activeKey});
    this.setState({ ipanes:ipanes, iactiveKey:activeKey });
  }
  removeinspection(targetKey) {
    //TODO: 删除提示
    let activeKey = this.state.iactiveKey;
    let lastIndex;
    this.state.ipanes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    let ipanes = this.state.ipanes.filter(pane => pane.key !== targetKey);
    ipanes.forEach((pane, i) => {
      pane.key = "ifetus-"+i;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = ipanes[lastIndex].key;
    }
    this.setState({ ipanes:ipanes, iactiveKey:activeKey });
  }


  /* ================================== UI视图 ==================================== */

  // 术前记录
  configpreoperative_record(){
    return {
      step: 1,
        rows: [
        {
          columns: [
            { name: 'operation_date[手术日期]', type: 'date', span: 7, valid: 'required'},
            {span: 1},
            { name: 'temperature(℃)[体@@@温 ]', type: 'input', span: 5, valid: 'required'},
            {span: 1},
            { name: 'BP(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 7, valid: (value)=>{
              let message = '';
              if(value){
                message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
              }else{
                
              }
              return message;
            }},
          ]
        },
      ]
    }
  }
  
  // 送检项目
  configinspection_item() {
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'amniotic_fluid[羊水]', type: 'treeselect', options:coptions, span: 16 },
            { name: 'umbilical_blood[脐血]', type: 'treeselect', options:coptions, span: 16 },
            { name: 'villus[绒毛]', type: 'treeselect', options:qoptions, span: 16 }
          ]
        },     
      ]
    };
  }
  // 送检项目分开
  amniotic_fluid_item() {
    return {
      step: 1,
      rows: [{
        columns:[
          { name: 'amniotic_fluid[羊水]', type: 'treeselect', options:coptions, span: 16, isSelectParent: false }
        ]
      }]
    }
  }
  umbilical_blood_item() {
    return {
      step: 1,
      rows: [{columns:[{ name: 'umbilical_blood[脐血]', type: 'treeselect', options:coptions, span: 16, isSelectParent: false }]}]
    }
  }
  villus_item() {
    return {
      step: 1,
      rows: [{columns:[{ name: 'villus[绒毛]', type: 'treeselect', options:qoptions, span: 16, isSelectParent: false }]}]
    }
  }


  // 病史 暂不用
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
  // 手术操作
  configoperative_procedure(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'operation_items[手术项目]',  type: 'checkinput', options: baseData.operation_itemsOptions, span: 24},
          ]
        },
        {
          columns:[
            { name: 'operation_no[手术编号]', type: 'input', span: 5 },
            { name: 'operator[术者]', type: 'select', showSearch: true, options: baseData.operaterOptions, valid: 'required',span: 5 },
            { name: 'assistant[助手]', type: 'select', showSearch: true, options: baseData.assistantOptions, valid: 'required',span: 5},,
          ]
        },
        {
          columns:[
            { name: 'start_time[开始时间]', type: 'time',format:"HH:mm", valid: 'required', placeholder: '' ,span: 5},
            { name: 'end_time[结束时间]', type: 'time', format:"HH:mm", valid: 'required',placeholder: '' ,span: 5},
            { name: 'duration(min)[持续时间]', type: 'input', valid: 'required',span: 5 }
          ]
        },
        {
          columns:[
            { name: 'uterus[子宫]', type: 'select', showSearch: true, options: baseData.uterusOptions, valid: 'required',span: 5},
            { name: 'method[方法]', type: 'select', options: baseData.methodOptions, valid: 'required',span: 5},
            { name: 'placenta[胎盘]', type: 'select', options: baseData.placentaOptions, valid: 'required',span: 5},
            { name: 'instrument[器械]', type: 'select', options: baseData.instrumentOptions, valid: 'required',span: 5}
          ]
        },
        {
          columns:[
            { name: 'specimen_location[取样位置]', type: 'input',valid: 'required',span: 5},           
            { name: 'count[进入宫腔次数]',  type: 'input',valid: 'required',span: 5},
            { name: 'specimen_amount(ml)[标本]', type: 'input', showSearch: true, valid: 'required',span: 5},
            { name: 'character[性状]', type: 'select', showSearch: true, options: baseData.characterOptions, valid: 'required',span: 5},
          ]
        },
        {
          columns:[
            { name: 'process_evaluation[过程评估]', type: 'checkinput', radio: true, options: baseData.statusOptions, valid: 'required',span: 16}
          ]
        },
        {
          columns:[
            { name: 'special_case[术中特殊]', type: 'textarea',span: 20}
          ]
        },
        {
          columns:[
            { name: 'pre_fhr(bpm)[术前胎心率]', type: 'input', valid: 'required',span: 5},
            { name: 'after_fhr(bpm)[术后胎心率]', type: 'input', valid: 'required',span: 5}
          ]
        },
        {
          columns:[
            { name: 'diagnosis[诊断]', type: 'textarea', valid: 'required',span: 20},
            { name: 'diagnosis[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zz')}

          ]
        },
        {
          columns:[
            { name: 're_puncture[是否再次穿刺]', type: 'checkinput', radio: true, options: baseData.yesOptions, valid: 'required',span: 5}
          ]
        },
      ]
    }
  }

  // 医生嘱咐
  configdoctors_advice(){
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'doctor_advice[术后医嘱]', type: 'textarea', span: 16 },
            { name: 'doctor_advice_btn[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
          ]
        }
      ]
      }
  }


  // configbase(){
  //   return {
  //     step: 1,
  //     rows: [
  //       {
  //         label: '早孕超声:', span: 12, className:'labelclass2'
  //       },
  //       {
  //         columns:[
  //           { name: 'diagnosis(周)[停经]', type: 'input', span: 4 },
  //         ]
  //       },
  //     ]
  //     }
  // }


  /* ================================== 模板功能 ==================================== */

   // 打开modal框 & 根据type值搜索对应模板
   openModal = (type) => {
    if(type){
      const { id } = this.state;
      const reqData = {doctor:id, type: TEMPLATE_KEY[type]}
      service.medicalrecord.getTemplate(reqData)
        .then(res => {
          this.setState({
            templateObj: {
              isShowTemplateModal: true,
              type: type,
              templateList: res.object
            }
          })
        });    
    }
  };

  // 关闭modal框
  closeModal = () => {
    this.setState({
      templateObj: {isShowTemplateModal: false, type: '', templateList: []}
    })
  }

  // data - 新增数据项
  newTemplate = (data,allData) => {
    console.log(data,allData);
  }

  // data - 删除 数据项
  deleteTemplate = (data) => {
    console.log(data);
  }

   // 选择模板
   getTemplate = (data) => {
    console.log(data);
    // 得到数据 设置值
    const { type } = this.state.templateObj;
    console.log(type);
    // switch(type) {
    //   case 'zz':
    //   case 'CL':

    // }
  }

  adjustOrder = (key,acitonType) => {
    // 请求服务器，调整后重新获取.......
    console.log(key,acitonType);
  }


  /* ================================== 事件交互 ==================================== */

  
  handleChange(e, { name, value, target }){
    const { onChange } = this.props;
    console.log(value);
    // console.log(onChange);
    // onChange(e, { name, value, target })
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


  // 送检项目其他选项
  handleSJChange = (_, {name, value }) => {
    console.log(value);
  }

  /* ================================== 渲染类 ==================================== */
  
  // 关于 送检项目 渲染
  sjRender = (ipane) => {
    let DOM = [];
    for(let key in ipane) {

      if(ipane[key]['render']) {
        let obj = {};
        /*
         * 进入的数据必须有
         * {
         *  name: value
         * }
         * 不然treeSelect会显示一道横线
         */
        obj[key] = ipane[key].value;
        DOM.push(
          <div key={`${ipane.key}-${key}`}>
            {formRender(obj,this[`${key}_item`](),this.handleSJChange)}
          </div>
        )
      }
    }
    return (<div>{DOM}</div>);
  }
  
  /**
   * 模板
   */
  renderTreatment() {
    const { treatTemp, openTemplate } = this.state;
    const closeDialog = (e, items = []) => {
      this.setState({ openTemplate: false }, ()=>openTemplate&&openTemplate());
      items.forEach(i => i.checked = false);
      this.addTreatment(e, items.map(i => i.content).join('\n'));
    }

    const initTree = (pid, level = 0) => treatTemp.filter(i => i.pid === pid).map(node => (
      <Tree.TreeNode key={node.id} title={node.content}>
        {level < 10 ? initTree(node.id, level + 1) : null}
      </Tree.TreeNode>
    ));

    const handleCheck = (keys, { checked }) => {
      treatTemp.forEach(tt => {
        if (keys.indexOf(`${tt.id}`) !== -1) {
          tt.checked = checked;
        }
      })
    };

    const treeNodes = initTree(0);

    return (
      <Modal title="处理模板" closable visible={openTemplate} width={800} onCancel={e => closeDialog(e)} onOk={e => closeDialog(e, treatTemp.filter(i => i.checked))}>
        <Row>
          <Col span={12}>
            <Tree checkable defaultExpandAll onCheck={handleCheck} style={{ maxHeight: '90%' }}>{treeNodes.slice(0,treeNodes.length/2)}</Tree>
          </Col>
          <Col span={12}>
            <Tree checkable defaultExpandAll onCheck={handleCheck} style={{ maxHeight: '90%' }}>{treeNodes.slice(treeNodes.length/2)}</Tree>
          </Col>
        </Row>
      </Modal>
    )
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
      console.log(item);
      return <TreeNode key={item.key} {...item} dataRef={item} />;
    });

    // renderKTreeNode = data => {
    //   return data.map(item => {
    //     if (item.child) {
    //       return (
    //         <TreeNode title={item.menu_name} key={item.menu_id} appId={item.app_id} dataRef={item}>
    //           {this.renderKTreeNode(item.child)}
    //         </TreeNode>
    //       );
    //     }
  
    //     return <TreeNode title={item.menu_name} key={item.menu_code} dataRef={item}/>;
    //   });
    // };
  
  
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
    //const { entity={} } = this.props;
    const { entity, treeData} = this.state;

    const { isShowTemplateModal, templateList } = this.state.templateObj;

    const tableColumns = [
      {title: '编号', key: 'index', render: (_,__,index) => (<span>{index+1}</span>) },
      {title: '内容', dataIndex: 'content', key: 'content'},
    ]

    // console.log(this.state.treeData,entity);
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="fuzhen-left ant-col-5">
          {/* {treeData.length !== 0 ? (
            <Tree
            onSelect={this.onSelect}
            defaultExpandAll = {true}
            >    
            { this.renderTreeNodes(treeData)}
            </Tree>
          ): null} */}
          {/* 展示需要 先手写了 */}
          <Tree
            defaultExpandAll={true}
            onSelect={(selectedKeys) => this.getOperationDetail(selectedKeys)}
          >
            
            <TreeNode title="2019-12-12">
              <TreeNode title={<span style={{color: 'red'}}>羊膜腔穿刺（待完善）</span>}  />
            </TreeNode>
            <TreeNode title="2019-11-11">
              <TreeNode title="灭胎/毁胎术" />
            </TreeNode>
          </Tree>
        </div>
        <div className="fuzhen-right ant-col-19 main-pad-small width_7">
        <Collapse defaultActiveKey={['1','2','3','4','5','6','7']} >
          <Panel header="术前记录" key="1">
            {formRender(entity?entity.preoperative_record:entity, this.configpreoperative_record(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="手术操作" key="2" extra="">
            <Tabs
              onChange={this.onTabChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.ontabEdit}
            >
              {this.state.panes.map((pane, index) => <TabPane tab={'胎儿'+(index+1)} key={pane.key}>{formRender(pane, this.configoperative_procedure(), this.handleSJChange.bind(this))}</TabPane>)}
            </Tabs>
          </Panel>
          <Panel header="送检项目" key="3">
            <Tabs
              onChange={this.oninspectionChange}
              activeKey={this.state.iactiveKey}
              type="editable-card"
              onEdit={this.oninspectionEdit}
            >
              {/*{this.state.ipanes.map((pane, index) =>{*/}
              {/*  // TODO 这里的数据 entity 绑定有点问题，要更改通过 handleChange去做*/}
              {/*  // TODO 多了一横... 忘了为什么*/}
              {/*  console.log(pane);*/}
              {/*  let renderJXSDOM = [];*/}
              {/*  for(let key in pane) {*/}
              {/*    if(pane[key]['render']){*/}
              {/*      let obj = {};*/}
              {/*      obj[`${key}`] = pane[key];*/}
              {/*      delete obj[key]['render'];*/}
              {/*      renderJXSDOM.push(<div key={`ifatus${index}-${key}`}>{formRender(obj, this[`${key}_item`](), this.handleChange.bind(this))}</div>)*/}
              {/*    }*/}
              {/*  }*/}
              {/*  return (<TabPane tab={'胎儿'+(index+1)}  key={pane.key}>{renderJXSDOM}</TabPane>)*/}
              {/*})}*/}

              {this.state.ipanes.map((ipane,index) => <TabPane tab={`胎儿${index+1}`} key={ipane.key}>{this.sjRender(ipane)}</TabPane>)}

            </Tabs>
          </Panel>
          <Panel header="术后医嘱" key="4">
            
        <div className="single">{formRender(entity, this.configdoctors_advice(), this.handleChange.bind(this))}</div>
          </Panel>
        </Collapse>
        <div className="pull-right bottom-btn">
          <Button className="blue-btn " onClick={() => window.print()}>打印</Button>
          <Button className=" blue-btn save-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'))}>保存</Button>
          <Button className=" blue-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'), "open")}>保存并开立医嘱</Button>
        </div>

        {this.renderTreatment()}
        </div>

        {/* modal */}
        <Modal
          visible={isShowTemplateModal}
          onCancel={this.closeModal}
          footer={false}
          width="800px"
        >
          <div>
            <EditableTable
              columns={tableColumns}
              dataSource={templateList}
              newTemplate={this.newTemplate}
              deleteTemplate={this.deleteTemplate}
              adjustOrder={this.adjustOrder}
              getTemplate={this.getTemplate}
            />
          </div>
        </Modal>
      </Page>
    )
  }
}