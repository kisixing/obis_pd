import React, { Component, createElement } from "react";
import {Button, Tabs, Tree, Modal, Timeline, Collapse, Select} from 'antd';

import tableRender from '../../render/table';
import FuzhenTable from './table';
import Page from '../../render/page';
import service from '../../service';
import * as baseData from './data';
import formRender from '../../render/form';
import * as util from './util';
import editors from '../shouzhen/editors';

import EditableTable from './editableTable.js';

import store from '../store';
import { getAlertAction } from '../store/actionCreators.js';

import "../index.less";
import "./index.less";


const { TreeNode } = Tree;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

// β
// 修改后的
const _genotypeAnemia = baseData.genotypeAnemia.map(item => {
  if(item.value.indexOf('β') >= 0){
    const { value } = item;
    item.value = value.replace('β','b');
  }
  return item;
})
// function modal(type, title) {
//   message[type](title, 3)
// }

const TEMPLATE_KEY = {
  zz: 'dmr1', xb: 'dmr2', qt: 'dmr3', zd: 'dmr4', cl: 'dmr5'
}

export default class MedicalRecord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingTable: true,
      loading: true,
      activeElement: '',
      info: {},
      doctor: "",
      id: "",
      // 4个textarea的state
      // 主诊
      chief_complaint: '',
      // 现病史
      medical_history: '',
      // 诊断
      diagnosi: '',
      diagnosis: [],
      diagnosislist: {},
      // 处理措施
      treatment: '',
      // 预产期
      pregnancy_history: {},
      // 唐氏筛查
      downs_screen: {
        fkjc: true
      },
      // 地贫
      thalassemia: {},
      // 超声
      ultrasound: {
        menopause: "0", // 停经
        fetus:[]  // 胎儿信息
      },
      // 既往史
      past_medical_history:{
        hypertension: "",
        diabetes_mellitus: "",
        heart_disease: "",
        injury:"", // 好像是多余的
        other_disease: "",
        allergy: "",
        blood_transfusion: "",
        operation_history: [] // 手术史
      },
      // 家族史
      family_history: {
        diabetes_mellitus: "",
        hypertension: "",
        heritable_disease: "",
        congenital_malformation: ""
      },
      // 体格检查 请求时 physical_check-up
      physical_checkUp: {
        BP: "",
        fundal_height: "",
        waist_hip: "",
        pre_weight: "",
        current_weight: "",
        weight_gain: ""
      },

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
        { title: '胎儿一', content: '选项卡一内容', key: '1' },
        { title: '胎儿二', content: '选项卡二内容', key: '2' },
      ],     
      activeKey: 'fetus0',

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

  static Title = '专科病历';
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
    // 请求获取专科病历list
    service.medicalrecord.getspecialistemr()
      .then(res => {
        if(res.code === "200") {
          const { list } = res.object;
          const len = list.length;
          let f = 0;
          for(let i = 0; i < len ; i++) {if(list[i].children !== ""){f = i; break;}}
          this.setState(
            {treeData: list,selectedKeys: [list[f].children[0]['key']]},
            this.getspecialistemrdetail(list[f].children[0]['key'])
          );
        }
      });
  }


  /*====================== 请求方法 ======================*/

  /**
   * recordid - 输入选中病历id
   */
  getspecialistemrdetail = (recordid) => {
    const { downsScreen } = this.state;
    service.medicalrecord.getspecialistemrdetail({recordid})
      .then(res => {
        if(res.code === "200"){
          // 这里的res是整个页面的信息
          const { object } = res;
          // 将值设入state
          this.setState({
            doctor: object['doctor'],
            id: object['id'],
            chief_complaint: object['chief_complaint'],
            medical_history: object['medical_history'],
            diagnosi: object.diagnosis,
            treatment: object['treatment'],
            pregnancy_history: object['pregnancy_history'],
            downs_screen: object['downs_screen'],
            thalassemia: object['thalassemia'],
            ultrasound: object['ultrasound'],
            past_medical_history: object['past_medical_history'],
            family_history: object['family_history'],
            physical_checkUp: object['physical_check-up']
          })
        }
      })
  }

  /*============================ UI视图 ====================================*/
  
  // 前四个采用拼音首字母作方法的key参数

  // 主诉
  config() {
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'chief_complaint[主诉]', type: 'textarea', span: 16 },
            { name:'chief_complaint[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zz')}
          ]
        },     
      ]
    };
  }

  // 现病史
  configbs(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'medical_history[现病史]', type: 'textarea', span: 16 },
            { name:'medical_history[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('xb')}
          ]
        }
      ]
    }
  }

  configDiagnosi() {
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'diagnosi[诊断]', type: 'textarea', span: 16 },
            { name:'diagnosi[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
          ]
        }
      ]
    }
  }
  // 诊断 与 处理措施
  configTreatment(){
    return {
      step: 1,
      rows: [
        {
          columns:[
            { name: 'treatment[处理措施]', type: 'textarea', span: 16 },
            { name:'treatment[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
          ]
        },
      ]
    }
  }

  // 预产期
  configedd(){
    return {
      step: 1,
        rows: [
        {
          columns: [
            { name: 'LMD[末次月经]', type: 'date', span: 12, valid: 'required'},
            { name: 'EDD[预产期]', type: 'date', span: 12, valid: 'required'},
          ]
        },
        {
          columns: [
            { name: 'gravidity[G]', type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { name: 'parity[P]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { name: 'Abortion[A]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
            { name: 'exfetation[E]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          ]
        },
      ]
    }
  }

  // 唐氏筛查
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
            { span: 2 },
            { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [           
            { span: 2 },
            { name: 'HCG[β-HCG](mom)', type: 'input', span: 5 },
            { span: 1 },
            { name: 'PAPP[PAPP-A](mom)', type: 'input', span: 5 },         
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [   
            { span: 2 },
            { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
          ]
        },
        {
          label: '中期唐氏筛查:', span: 12, className:'labelclass2'
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 2 },
            { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
            { span: 1 },
            { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },            
            { span: 1 },
            { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            { span: 2 },
            { name: 'HCG[NTD风险]', type: 'input', span: 5 }, 
            { span: 1 },
            { name: 'NTD[β-HCG](mom)', type: 'input', span: 5 },
            { span: 1 },
            { name: 'AFP[AFP](mom)', type: 'input', span: 5 },         
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [               
            {span:2},
            { name: 'E3[E3](mom)', type: 'input', span: 5 },   
            {span:1},
            { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
          ]
        },
        {
          label: 'NIPT:', span: 12, className:'labelclass2'
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [
            {span:2},
            { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
            {span:1},
            { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
            {span:1},
            { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
          ]
        },
        {
          filter: entity => !entity && !entity.fkjc || isShow(entity.fkjc), columns: [               
            { name: 'Z_value[Z值]', type: 'input', span: 5 },   
            { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
          ]
        },
      ]
    };
  }

  // 地贫检查
  /* 
   * CAUTION 
   * 为迎合 输入b 展示 β 需求
   * 将option中的value的b替换为β
   */ 
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
          { name: 'yjcuch(g/L)[Hb]', type: 'input', span: 7, showSearch: true, valid: 'required'},
          { name: 'yjzhouq(fL)[MCV]',  type: 'input', span: 7, showSearch: true, valid: 'required'},
          { name: 'yjchix[MCH]',  type: 'input', span: 7, showSearch: true, valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'yjcuch[HbA2]', type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'yjzhouq[血型]',  type: 'select', span: 6, showSearch: true, options: baseData.xuexingOptions, valid: 'required'},
          {name:'ckrh[]', type: 'select',span:2, options: baseData.xuexing2Options},
          { name: 'yjchix[地贫基因型]',  type: 'select', span: 6, showSearch: true, options: _genotypeAnemia ,valid: 'required'},
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
          { name: 'yjcuch(g/L)[Hb]', type: 'input', span: 7, showSearch: true,  valid: 'required'},
          { name: 'yjzhouq(fL)[MCV]',  type: 'input', span: 7, showSearch: true,  valid: 'required'},
          { name: 'yjchix[MCH]',  type: 'input', span: 7, showSearch: true, valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'yjcuch[HbA2]', type: 'input', span: 7, showSearch: true, valid: 'required'},
          { name: 'yjzhouq[血型]',  type: 'select', span: 7, showSearch: true, options: baseData.xuexingOptions, valid: 'required'},
          {name:'ckrh[]', type: 'select',span:2, options: baseData.xuexing2Options},
          { name: 'yjchix[地贫基因型]',  type: 'select', span: 7, showSearch: true,  options: _genotypeAnemia ,valid: 'required'},
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

  // 早孕超声
  configbase(){ 
    return {
      step: 1,
      rows: [
        {
          label: '早孕超声:', span: 12, className:'labelclass2'
        },
        {
          columns:[
            { name: 'menopause(周)[停经]', type: 'input', span: 4 },
          ]
        },
      ]
      }
  }
  // 胎儿
  config4(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { name: 'CRL(mm)[CRL]', type: 'input', span: 7 },
            { name: 'gestational_week(周)[如 孕]', type: 'input', span: 7 },
            {span:2},
            { name: 'NT(mm)[NT]', type: 'input', span: 7 },
          ]
        },
        {
          columns:[
            { name: 'other_anomalies[异常结果描述]', type: 'input', span: 8 },
          ]
        },
        {
          columns:[
            { name: 'middle[中孕超声]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.BvColumns },
          ]
        },
      ]
    }
  }

  // 既往史
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
          { name: 'hypertension[高血压]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
          { name: 'diabetes_mellitus[糖尿病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'heart_disease[心脏病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'other_disease[其他病史]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:15 },
          ]
        },
        {
          columns:[
            { name: 'allergy[过敏史]', type: 'checkinput', valid: 'required', options: baseData.ywgmOptions, unselect: '无' },
          ]
        },
        {
          columns:[
            { name: 'blood_transfusion[输血史]', type: 'checkinput', valid: 'required', unselect: '无', options: baseData.sxsOptions },
          ]
        },
        {
          columns:[
            { name: 'operation_history[手术史]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.shoushushiColumns },
          ]
        },
      ]
    }
  }
  // 家族史
  config6(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { span: 1 },
            {name:'hypertension[高血压]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'diabetes_mellitus[糖尿病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },       
        {
          columns:[
            { span: 1 },
            {name:'congenital_malformation[先天畸形]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'heritable_disease[遗传病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        },
        {
          columns:[
            { span: 1 },
            {name:'que[其他]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
          ]
        }
      ]
    }
  }
  // 体格检查
  config7(){
    return {
      step : 3,
      rows:[
        {
          columns:[
            { 
              name: 'BP(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 8, valid: (value)=>{
              let message = '';
              if(value){
                // 缺少valid
                // message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
                
              }else{
                message = valid('required',value)
              }
              return message;
            }
          },
          {
            name:'add_FIELD_pulse[浮@@@肿 ]', type:'select', span:8, showSearch: true, options: baseData.xzfOptions
          },
          ]
        },
        {
          columns:[
            {name:'fundal_high(cm)[宫@@@高 ]', type:'input', span:8, valid: 'required|number|rang(10,100)'},
           
            {name:'waist_hip(cm)[腹@@@围 ]', type:'input', span:8, valid: 'required|number|rang(0,100)'},
          ]
        },
        {
          columns:[
            {name:'pre_weight(kg)[孕前体重]', type:'input', span:6, valid: 'required|number|rang(10,100)'},
            
            {name:'current_weight(kg)[现 体 重 ]', type:'input', span:6, valid: 'required|number|rang(0,100)'},
            
            {name:'weight_gain(kg)[体重增长]',type:'input', span:6, valid: 'required|number|rang(0,100)'},
          ]
        }
      ]
    }
  }

  /* ============================ 模板功能 ==================================== */ 
  
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
  clostModal = () => {
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

  adjustOrder = (key,acitonType) => {
    // 请求服务器，调整后重新获取.......
    console.log(key,acitonType);
  }

  /*============================ 页面事件交互类 ====================================*/

  handleChange(e, { name, value, target }){
    console.log(value);
    // const { onChange } = this.props;
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

  
  // 切换胎儿选项卡
  onChange(targetKey) {
     this.setState({activeKey: targetKey});
    // this.setState({ activeKey });
  }

  // 超声检查 胎儿栏编辑操作
  onEdit(targetKey, action) {
    console.log(targetKey, action);
    // this[action](targetKey);
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




  // 选中节点触发-------如何在这里获取到选中节点的app_id？？？
  onSelect = (selectedKeys,{event, node, selected}) => {
    // 使用 eventKey 去拿会这个信息
    const { eventKey } = node.props;
    console.log(eventKey);
    if (selectedKeys.length > 0) {
      // 防止编辑时重复点击造成选中节点为空
      this.setState({selectedKeys});
    }
  };


  /*============================ 渲染类 ====================================*/

  renderTreeNodes = data => 
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
    return <TreeNode  key={item.key} {...item} dataRef={item} />;
  });

  /*============================ 数据处理 ====================================*/
  
  

  render(){
    const { entity={} } = this.props;
    const { selectedKeys, treeData, activeKey } = this.state;
    const { chief_complaint, medical_history, diagnosi, treatment } = this.state;
    const { pregnancy_history, downs_screen, ultrasound, past_medical_history, family_history, thalassemia, physical_checkUp } = this.state;
    const { isShowTemplateModal, templateList } = this.state.templateObj;
    
    const tableColumns = [
      {title: '编号', key: 'index', render: (_,__,index) => (<span>{index+1}</span>) },
      {title: '标题', dataIndex: 'key', key: 'key'},
      {title: '内容', dataIndex: 'content', key: 'content'},
    ]
    // console.log(baseData.genotypeAnemia);
    return (
      <Page className='fuzhen font-16 ant-col'>
        {/* 左端树形选择 */}
        <div className="fuzhen-left ant-col-5" style={{margin: "20px 0"}}>
          <div className="single">
          { treeData.length !== 0 ? (
            <Tree
              onSelect={this.onSelect}
              defaultExpandAll
              defaultSelectedKeys={selectedKeys}
              selectedKeys={selectedKeys}         
            >    
            {this.renderTreeNodes(treeData)}
          </Tree>
          ): null}
          </div>
        </div>

        {/* 右端表单区域 */}
        <div className="fuzhen-right ant-col-19 main-pad-small width_7"> 
          <Collapse defaultActiveKey={['c1','c2','c3','c4','c5','c6','c7']} >

            <div className="single">{formRender({chief_complaint}, this.config(), this.handleChange.bind(this))}</div>
          
            {/* 这里 1、3 key值莫名其妙的报错 */}
            <Panel header="预产期" key="c1">
              {formRender(pregnancy_history, this.configedd(), this.handleChange.bind(this))}
            </Panel>
            <div className="single">{formRender({medical_history}, this.configbs(), this.handleChange.bind(this))}</div>
            
            {/*  类数组对象的 解析问题 我们先做一个留空处理  */}
            <Panel header="唐氏筛查" key="c2">
              {formRender(downs_screen, this.config2(), this.handleChange.bind(this))}
            </Panel>
            <Panel header="地贫/血型检查" key="c3">
              {formRender(thalassemia, this.config3(), this.handleChange.bind(this))}
            </Panel>


            <Panel header="超声检查" key="c4">
            {formRender(ultrasound, this.configbase(), this.handleChange.bind(this))}
            <Tabs
                onChange={this.onChange.bind(this)}
                activeKey={activeKey}
                type="editable-card"
                onEdit={this.onEdit}
            >
                {ultrasound.fetus.length !== 0 ? ( ultrasound.fetus.map((v,index) => 
                    <TabPane tab={`胎儿${index+1}`} key={`fetus${index}`}>
                      {formRender(ultrasound.fetus[index], this.config4(), this.handleChange.bind(this))}
                    </TabPane>
                  )) : null }
              </Tabs>
            </Panel>

            <Panel header="既往史" key="c5">
              {formRender(past_medical_history, this.config5(), this.handleChange.bind(this))}
            </Panel>
            <Panel header="家族史" key="c6">
              {formRender(family_history, this.config6(), this.handleChange.bind(this))}
            </Panel>
            <Panel header="体格检查" key="c7">
              {formRender(physical_checkUp, this.config7(), this.handleChange.bind(this))}
            </Panel>
            <div className="single">{formRender({diagnosi},  this.configDiagnosi(), this.handleChange.bind(this))}</div>
            <div className="single">{formRender({treatment}, this.configTreatment(), this.handleChange.bind(this))}</div>
          </Collapse>
          <Button className="pull-right blue-btn bottom-btn save-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'))}>保存</Button>
          <Button className="pull-right blue-btn bottom-btn" type="ghost" onClick={() => this.handleSave(document.querySelector('.fuzhen-form'), "open")}>保存并开立医嘱</Button>
        </div>
        
        <div className="ant-col-24" style={{textAlign: 'center', margin: '20px 0'}}>
          <Button onClick={() => window.print()}>打印</Button>
        </div>

        {/* modal */}
        <Modal
          visible={isShowTemplateModal}
          onCancel={this.clostModal}
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
            />
          </div>
        </Modal>
      </Page>
    )
  }
}