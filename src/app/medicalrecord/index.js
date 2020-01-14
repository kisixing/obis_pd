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

function modal(type, title) {
  message[type](title, 3)
}

export default class MedicalRecord extends Component {

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
          title: '2020-01-07',
          key: '0-1',
          children: [
            { title: '遗传门诊病历', key: '0-1-0-0' },
            { title: '胎儿疾病', key: '0-1-0-1' },
            { title: '胎儿疾病', key: '0-1-0-2' },
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
  config2(){
    const isShow = data => {
      return !data || !data.filter || !data.filter(i=>['未检查','已查'].indexOf(i.label)!==-1).length;
    };
    return {
      step: 1,
      rows: [
        
        {
          className: 'tangshai-group', columns: [
            { name: 'fkjc[]', type: 'checkinput', radio: true, options: baseData.wjjOptions, span: 8 }
          ]
        },
        {
          label: '早期唐氏筛查:', span: 12, className:'labelclass2'
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'zqts21[21三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'zqts18[18三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'zqts13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [           
            { span: 1 },
            { name: 'hcgEarly[β-HCG](mom)', type: 'input', span: 5 },
            { span: 1 },
            { name: 'pappEarly[PAPP-A](mom)', type: 'input', span: 5 },         
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [   
            { span: 1 },
            { name: 'otherExceptEarly[其他异常]', type: 'input', span: 11 }
          ]
        },
        {
          label: '中期唐氏筛查:', span: 12, className:'labelclass2'
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'cqts21[21三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'cqts18[18三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'cqts13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'hcgEarly[NTD风险]', type: 'input', span: 5 }, 
            { span: 1 },
            { name: 'hcgEarly[β-HCG](mom)', type: 'input', span: 5 },
            { span: 1 },
            { name: 'pappEarly[AFP](mom)', type: 'input', span: 5 },         
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [               
            { span: 1 },
            { name: 'pappEarly[E3](mom)', type: 'input', span: 5 },   
            { span: 1 },
            { name: 'otherExceptEarly[其他异常]', type: 'input', span: 11 }
          ]
        },
        {
          label: 'NIPT:', span: 12, className:'labelclass2'
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'cqts21[21三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'cqts18[18三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'cqts13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [               
            { span: 1 },
            { name: 'pappEarly[Z值]', type: 'input', span: 5 },   
            { span: 1 },
            { name: 'otherExceptEarly[其他异常]', type: 'input', span: 11 }
          ]
        },
      ]
    };
  }
  config3(){
    const isShow = data => {
      return !data || !data.filter || !data.filter(i=>['未检查','已查'].indexOf(i.label)!==-1).length;
    };
    return {
      step: 1,
      rows: [
      {
        label: '女方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'yjcuch[Hb]', type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjzhouq[MCV]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjchix[MCH]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'yjcuch[HbA2]', type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjzhouq[血型]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjchix[地贫基因型]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'otherExceptEarly[其他异常]', type: 'input', span: 11 }
        ]
      },
      {
        label: '男方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'yjcuch[Hb]', type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjzhouq[MCV]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjchix[MCH]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'yjcuch[HbA2]', type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjzhouq[血型]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { span: 1 },
          { name: 'yjchix[地贫基因型]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'otherExceptEarly[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]};
  }
  configedd(){
    return {
      step: 1,
        rows: [
        {
          columns: [
            { name: 'gesmoc[末次月经]', type: 'date', span: 5, valid: 'required'},
            { name: 'gesexpect[预产期]', type: 'date', span: 5, valid: 'required'},
          ]
        },
        {
          columns: [
            { name: 'yjcuch[G]', type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { span: 1 },
            { name: 'yjzhouq[P]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { span: 1 },
            { name: 'yjchix[A]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { span: 1 },
            { name: 'yjtongj[E]',  type: 'select', span: 4, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          ]
        },
      ]
    }
  }
  config() {
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'treatment[主诉]', type: 'textarea', span: 16 },
            { name:'treatment[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: this.handleTreatmentClick.bind(this)}
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

  config4(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'CRL(mm)[CRL]', type: 'input', span: 4 },
            { name: 'ruyun(周)[如 孕]', type: 'input', span: 4 },
            {span:2},
            { name: 'nt(mm)[NT]', type: 'input', span: 4 },
          ]
        },
        {
          columns:[
            { name: 'exception()[异常结果描述]', type: 'input', span: 8 },
          ]
        },
        {
          columns:[
            { name: 'operationHistory[中孕超声]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.BvColumns },
          ]
        },
      ]
    }
  }
  config5(){
    return {
      step : 3,
      rows: [
        // {
        //   columns:[
        //     { name: 'bsjibing[疾病史]', type: 'checkinput', valid: 'required', unselect:'无', options: baseData.jibOptions.map(v=>({...v, label:`${v.label}(input)`})) },
        //   ]
        // },
        {
          columns:[
          { name: 'bsshoushu[高血压]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
          { name: 'bsshoushu[糖尿病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'bsshoushu[心脏病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'bsshoushu[其他病史]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'bsguomin[过敏史]', type: 'checkinput', valid: 'required', options: baseData.ywgmOptions, unselect: '无' },
          ]
        },
        {
          columns:[
            { name: 'hobtabp[输血史]', type: 'checkinput', valid: 'required', unselect: '无', options: baseData.sxsOptions },
          ]
        },
        {
          columns:[
            { name: 'operationHistory[手术史]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.shoushushiColumns },
          ]
        },
      ]
    }
  }
  config6(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { span: 1 },
            {name:'rpr[高血压]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'rpr[糖尿病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },       
        {
          columns:[
            { span: 1 },
            {name:'rpr[先天畸形]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'rpr[遗传病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'rpr[其他]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        }
      ]
    }
  }
  config7(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { 
              name: 'ckpressure(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 5, valid: (value)=>{
              let message = '';
              if(value){
                message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
              }else{
                message = valid('required',value)
              }
              return message;
            }},
            {span:3},
            {name:'add_FIELD_pulse[浮@@@肿 ]', type:'select', span:4, showSearch: true, options: baseData.xzfOptions},
          ]
        },
        {
          columns:[
            {name:'ckgongg(cm)[宫@@@高 ]', type:'input', span:3, valid: 'required|number|rang(10,100)'},
            {span:5},
            {name:'ckfw(cm)[腹@@@围 ]', type:'input', span:3, valid: 'required|number|rang(0,100)'},
          ]
        },
        {
          columns:[
            {name:'ckcurtizh(kg)[孕前体重]', type:'input', span:3, valid: 'required|number|rang(10,100)'},
            {span:5},
            {name:'cktizh(kg)[现 体 重 ]', type:'input', span:3, valid: 'required|number|rang(0,100)'},
            {span:5},
            {name:'ckbmi(kg)[体重增长]',type:'input', span:3, valid: 'required|number|rang(0,100)'},
          ]
        }
      ]
    }
  }
  configtreatment(){
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'diagnosis[诊断]', type: 'textarea', span: 16 },
          ]
        },
        {
          columns:[
            { name: 'treatment[处理措施]', type: 'textarea', span: 16 },
          ]
        },
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
          <div className="single">{formRender(entity, this.config(), this.handleChange.bind(this))}</div>
          <Panel header="预产期" key="1">
            {formRender(entity, this.configedd(), this.handleChange.bind(this))}
          </Panel>
          <div className="single">{formRender(entity, this.configbs(), this.handleChange.bind(this))}</div>
          <Panel header="唐氏筛查" key="2" extra="">
            {formRender(entity, this.config2(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="地贫/血型检查" key="3">
            {formRender(entity, this.config3(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="超声检查" key="4">
          {formRender(entity, this.configbase(), this.handleChange.bind(this))}
          <Tabs
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            >
              {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{formRender(entity, this.config4(), this.handleChange.bind(this))}</TabPane>)}
            </Tabs>
          </Panel>
          <Panel header="既往史" key="5">
            {formRender(entity, this.config5(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="家族史" key="6">
            {formRender(entity, this.config6(), this.handleChange.bind(this))}
          </Panel>
          <Panel header="体格检查" key="7">
            {formRender(entity, this.config7(), this.handleChange.bind(this))}
          </Panel>
          <div className="single">{formRender(entity, this.configtreatment(), this.handleChange.bind(this))}</div>
        </Collapse>
        <Button className="pull-right blue-btn bottom-btn save-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'))}>保存</Button>
        <Button className="pull-right blue-btn bottom-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'), "open")}>保存并开立医嘱</Button>
        </div>
      </Page>
    )
  }
}