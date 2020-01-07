import React, { Component } from "react";
import { Select, Button, Popover, Input, Tabs, Tree, Modal, Icon, Spin,Timeline, Collapse, message } from 'antd';

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

function modal(type, title) {
  message[type](title, 3)
}

export default class Patient extends Component {

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

  config() {
    const isShow = data => {
      return !data || !data.filter || !data.filter(i=>['未检查','已查'].indexOf(i.label)!==-1).length;
    };
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'treatment[主诉]', type: 'textarea', span: 16 },
            { name:'treatment[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: this.handleTreatmentClick.bind(this)}
          ]
        },
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
        {
          columns:[
            { name: 'treatment2[现病史]', type: 'textarea', span: 16 },
            { name:'treatment2[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: this.handleTreatmentClick.bind(this)}
          ]
        },
        {
          className: 'tangshai-group', columns: [
            { name: 'fkjc[唐氏筛查]', type: 'checkinput', radio: true, options: baseData.wjjOptions, span: 8 }
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'ckwaiy[外阴]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'ckyind[阴道]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'ckgongj[宫颈]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'ckgongt[子宫]', type: 'input', span: 5 }
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 1 },
            { name: 'ckfuj[附件]', type: 'input', span: 5 },
          ]
        },
      ]
    };
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
        <div className="fuzhen-right ant-col-19 main-pad-small">
        {formRender(entity, this.config(), this.handleChange.bind(this))}
        </div>
      </Page>
    )
  }
}