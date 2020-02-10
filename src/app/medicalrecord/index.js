import React,{ Component} from 'react';
import {Tree, Tabs, Collapse, Modal, Button} from 'antd';

import formRender from '../../render/form';
import Page from '../../render/page';
import service from "../../service";

import './index.less';
import '../index.less';

import * as baseData  from './data';
import EditableTable from "./editableTable";

const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const ButtonGroup  = Button.Group;

// 应对 输入 b 搜索 β
// 修改后的 提交可能还要改一下
const _genotypeAnemia = baseData.genotypeAnemia.map(item => {
  if(item.value.indexOf('β') >= 0){
    const { value } = item;
    item.value = value.replace('β','b');
  }
  return item;
})

// 版本的KEY
const TEMPLATE_KEY = {
  zz: 'dmr1', xb: 'dmr2', qt: 'dmr3', zd: 'dmr4', cl: 'dmr5', rs: 'dmr6'
}

/**
 * TODO
 * 1、差提交的功能还没有补上
 *
 *  大致的页面逻辑理一下
 *   1 - Button的选中 和 哪一个div展现是绑定的  使用 formType
 *   2 - currentTreeKeys，当存在大于0的keys值，button组要隐藏，新建的默认key为-1，回写服务器后重新获取就好
 *   3 - 存在的BUG 新建病历后，又加载了新的病历，回选待完善不成功。
 *       解决，当加载数据时，删除“新建病历” (不行，会导致别人写了一半没了的问题)
 *        2020-02-10
 *        最后的方法 就是 做个currentNewingSpecialistemrData，这样才能并行数据吧
 */

export default class MedicalRecord extends Component{
  constructor(props) {
    super(props);
    this.state = {
      // data
      pregnancy_history: {
        LMD: "",
        EDD: "",
        gravidity: "",
        parity: "",
        Abortion: "",
        exfetation: ""
      },
      downs_screen: {
        early: {}, middle: {}, nipt: {}
      },
      thalassemia: {
        wife: {}, husband: {}
      },
      ultrasound: { menopause: '', fetus: []},
      past_medical_history: {},
      family_history: {},
      physical_check_up: {},


      // 当前数据类型 - 属于数据与控制
      formType: '',
      /* control */
      // 当前选择的书的key
      currentTreeKeys: '',
      // 正在创建病历
      isNewingSpe: false,

      // 胎儿疾病 - 超声检查 Tab
      uFetusActiveKey: '',

      // 模板功能
      templateObj: {
        isShowTemplateModal: false,
        type: '',
        templateList: []
      },
    }
  }

  componentDidMount() {
    service.medicalrecord.getspecialistemr()
      .then(res => {
        console.log(res);
        if(res.code === "200" || 200) {
          this.setState({treeList: res.object.list},() => {
            const { treeList } = this.state;
            // service.medicalrecord.getspecialistemrdetail({recordid: treeList[0].children[0]['key'], formType: "1"})
            //   .then(res => {
            //     if(res.code === 200 || "200") this.convertSpecialistemrDetail(res.object)
            //   })
          })
        }
      })
  }

  /* ========================= formRender渲染UI config  ============================ */
  /*
  * 通用型
  * */
  // 主诉
  chief_complaint_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'chief_complaint[主诉]', type: 'textarea', span: 16 },
          { name:'chief_complaint[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zz')}
        ]
      },
    ]
  });
  // 现病史
  medical_history_config = () => ({
    step : 3,
    rows:[
      {
        columns:[
          { name: 'medical_history[现病史]', type: 'textarea', span: 16 },
          { name:'medical_history[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('xb')}
        ]
      }
    ]
  });
  // 其他检查
  other_exam_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'other_exam[其他]', type: 'textarea', span: 16 },
          { name:'other_exam[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
        ]
      }
    ]
  });
  // 诊断
  diagnosis_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'diagnosis[诊断]', type: 'textarea', span: 16 },
          { name:'diagnosis[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
        ]
      }
    ]
  });
  // 处理
  treatment_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'treatment[处理措施]', type: 'textarea', span: 16 },
          { name:'treatment[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  });

  // 预产期 - 胎儿+遗传
  pregnancy_history_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          { name: 'lmd[末次月经]', type: 'date', span: 12, valid: 'required'},
          { name: 'edd[预产期]', type: 'date', span: 12, valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'gravidity[G]', type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'parity[P]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'abortion[A]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'exfetation[E]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
    ]
  });
  // 地贫/血型检查 - 胎儿+遗传
  wife_thalassemia = () => ({
    step: 1,
    rows: [
      {
        label: '女方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'hb(g/L)[Hb]', type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'mcv(fL)[MCV]',  type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'mch[MCH]',  type: 'input', span: 6, showSearch: true, valid: 'required'},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'hbA2[HbA2]', type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'blood_group[血型]',  type: 'select', span: 6, showSearch: true, options: baseData.xuexingOptions, valid: 'required'},
          { name: 'genotype[地贫基因型]',  type: 'select', span: 11, showSearch: true, options: _genotypeAnemia ,valid: 'required'}
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  });
  husband_thalassemia = () => ({
    step: 1,
    rows: [
      {
        label: '男方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'hb(g/L)[Hb]', type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'mcv(fL)[MCV]',  type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'mch[MCH]',  type: 'input', span: 6, showSearch: true, valid: 'required'},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'hbA2[HbA2]', type: 'input', span: 6, showSearch: true, valid: 'required'},
          { name: 'blood_group[血型]',  type: 'select', span: 6, showSearch: true, options: baseData.xuexingOptions, valid: 'required'},
          { name: 'genotype[地贫基因型]',  type: 'select', span: 11, showSearch: true, options: _genotypeAnemia ,valid: 'required'}
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  });
  // 既往史 - 胎儿+遗传
  past_medical_history_config = () => ({
    step : 3,
    rows: [
      {
        columns:[
          { name: 'hypertension[高血压]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'diabetes_mellitus[糖尿病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'heart_disease[心脏病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'other_disease[其他病史]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'allergy[过敏史]', type: 'checkinput', valid: 'required', options: baseData.ywgmOptions, unselect: '无', span:24 },
        ]
      },
      {
        columns:[
          { name: 'blood_transfusion[输血史]', type: 'checkinput', valid: 'required', unselect: '无', options: baseData.sxsOptions, span: 24 },
        ]
      },
      {
        columns:[
          { name: 'operation_history[手术史]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.shoushushiColumns },
        ]
      },
    ]
  });
  // 家族史 - 胎儿+遗传
  family_history_config = () => ({
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
          {name:'other_disease[其他]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
        ]
      }
    ]
  });
  // 体格检查 - 胎儿 + 复诊
  physical_check_up_config = () => ({
    step : 3,
    rows:[
      {
        columns:[
          {
            name: 'bp(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 8, valid: (value)=>{
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
            name:'edema[浮@@@肿 ]', type:'select', span:8, showSearch: true, options: baseData.xzfOptions
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
  });


  /*
  * 胎儿疾病部分
  * */
  // 唐氏筛查 - 未检查 按钮 安排在表单外处理
  early_downs_screen_config = () => ({
    step: 1,
    rows: [
      {
        label: '早期唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      {
         columns: [
          { span: 2 },
          { name: 'hcg[β-HCG](mom)', type: 'input', span: 5 },
          { span: 1 },
          { name: 'papp[PAPP-A](mom)', type: 'input', span: 5 },
        ]
      },
      {
         columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  });
  middle_downs_screen_config = () => ({
    step: 1,
    rows: [
      {
        label: '中期唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      // {
      //   columns: [
      //     { span: 2 },
      //     { name: 'HCG[β-HCG](mom)', type: 'input', span: 5 },
      //     { span: 1 },
      //     { name: 'PAPP[PAPP-A](mom)', type: 'input', span: 5 },
      //   ]
      // },
      {
        columns: [
          { span: 2 },
          { name: 'ntd[NTD风险]', type: 'input', span: 5},
          { span: 1 },
          { name: 'hcg[β-HCG](mom)', type: 'input', span: 5 },
          { span: 1 },
          { name: 'afp[AFP](mom)', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  });
  NIPT_downs_screen_config = () => ({
    step: 1,
    rows: [
      {
        label: 'NIPT唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'z21[21三体Z值]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'z18[18三体Z值]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'z13[13三体Z值]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  });
  // 早孕超声（周） + 胎儿超声栏
  ultrasound_menopause_config = () => ({
    step: 1,
    rows: [
      {
        label: '早孕超声:', span: 12, className:'labelclass2'
      },
      {
        columns:[{ name: 'menopause(周)[停经]', type: 'input', span: 4 },]
      }
    ]
  });
  ultrasound_fetus_config = () => ({
    step : 3,
    rows:[
      {
        columns:[
          { name: 'crl(mm)[CRL]', type: 'input', span: 7 },
          { name: 'crlweek(周)[如 孕]', type: 'input', span: 7 },
          {span:2},
          { name: 'nt(mm)[NT]', type: 'input', span: 7 },
        ]
      },
      {
        columns:[
          { name: 'excdesc[异常结果描述]', type: 'input', span: 8 },
        ]
      },
      {columns: [{label: '术前超声检查' , span: 12}]},
      {
        columns:[
          { name: 'middle[中孕超声]', type: 'table', valid: 'required', pagination: false, editable: true, options: baseData.BvColumns },
        ]
      },
    ]
  });

  /*
  * 遗传病史部分
  * */
  // 染色体核型
  karyotype_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'karyotype[诊断]', type: 'textarea', span: 16 },
          { name:'karyotype[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
        ]
      }
    ]
  });

  /*
  * 复诊部分
  * TODO 未确定变量
  * */
  // 复诊日期+孕周

  // 病情变化
  stateChange_config =() => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'stateChange[病情变化]', type: 'textarea', span: 16 },
          { name:'stateChange[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  })
  // 前次检查结果
  lastResult_config = () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'lastResult[前次检查结果]', type: 'textarea', span: 16 },
          { name:'lastResult[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  });

  /* ========================= 事件交互类 =========================== */
  // 处理三个病例切换的事件
  handleBtnChange = (key) => {
    // TODO setState重复渲染问题 - 待解决
    this.setState({formType: key});
  };
  // TODO 处理超声婴儿edit
  handleUFetusEdit = () => {

  };
  // 树形结构选择
  handlerTreeSelect = (selectedKeys, {selected, node}) => {
    // 这里禁用取消
    console.log(selectedKeys);
    if(node.props.children || !selected || Number(selectedKeys[0]) < 0) {
      console.log('不允许父节点请求，不允许取消');
      return ;
    }
    // 先请求好数据再setState， 不然render会报错
    service.medicalrecord.getspecialistemrdetail({recordid: selectedKeys[0]}).then(res => {
      console.log(res);
      if(res.code === "200" || 200) {
        this.convertSpecialistemrDetail(res.object);
        this.setState({currentTreeKeys: selectedKeys});
      }
    });
  };
  // 新建病历
  newSpecialistemr = () => {
    const ONE_DAY_MS = 86400000;
    const { treeList } = this.state;
    // 判断第一个是否是今天
    const nD = new Date();
    if(nD.getTime() - Date.parse(treeList[0]['title']) > ONE_DAY_MS) {
      //不是今天
      let m = nD.getMonth() + 1, d = nD.getDate();
      treeList.splice(0,0,{title: `${nD.getFullYear()}-${m < 10 ? `0${m}`: m}-${d < 1?`0${d}`:d}` , key: "n-1", children: [{title: "待完善病历", key: "-1"}]})
    }else {
      treeList[0]['children'].splice(0,0,{title: '待完善病历', key: "-1"})
    }
    // 这里也要清空数据
    this.clearSpecialistemrDetail();
    this.setState({treeList, isNewingSpe: true, currentTreeKeys: ["-1"]});
  }

  /* ========================= 渲染方法 ============================== */
  // 渲染左侧记录树
  renderTree = (data) => {
    let tnDOM = [];
    // 统一接口格式后可对此处封装
    if(data === undefined || data.length === 0) {
      return <div>无手术记录</div>;
    }
    data.forEach(item => {
      tnDOM.push(
        <TreeNode title={item['title'].slice(0,12)} key={item['key']}>
          {item['children'].map(v => (
            <TreeNode title={v['title']} key={v['key']}/>
          ))}
        </TreeNode>
      )
    });
    return <Tree
      onSelect={this.handlerTreeSelect}
      defaultExpandAll
      selectedKeys={this.state.currentTreeKeys || []}
      multiple={false}
    >{tnDOM}</Tree>;
  };
  // 渲染 超声检查 胎儿Tab
  renderUFetusTabPane = (fetusData) => {
    if(fetusData.length === 0) return <div key="none">暂无数据</div>;
    const fetusTabPaneDOM = [];
    fetusData.forEach((fetus,index) => {
      fetusTabPaneDOM.push(
        <TabPane key={fetus.id} tab={`胎儿-${index+1}`}>
          {formRender(fetus,this.ultrasound_fetus_config(),this.handleChange)}
        </TabPane>
      );
    })
    return fetusTabPaneDOM;
  };

  /* ========================= 其他 ================================== */
  // 获取数据 整合进入state
  convertSpecialistemrDetail = (object) => {
    this.clearSpecialistemrDetail();
    this.setState({...object});
  };
  // 清空数据 -- 有必要的话可以开三组数据防止时间过长
  clearSpecialistemrDetail = () => {
    const newState = this.state;
    // 定义不需要清空的值
    const UNCLEARKEYS = ['treeList','currentTreeKeys','templateObj'];
    console.log(this.state);
    // 除控制需要的值以外，其他全部清除掉
    for(let key in newState){
      if(key !== 'treeList' && key !== 'currentTreeKeys' && key !== 'templateObj'){
        const type = typeof newState[key];
        if(type === 'string') {
          newState[key] = '';
        }else if(type === 'array') {
          newState[key] = [];
        }else if(type === 'object') {
          newState[key] = {};
        }
      }
    }
    this.setState(newState);
  };

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
  closeModal = () => {
    this.setState({
      templateObj: {isShowTemplateModal: false, type: '', templateList: []}
    })
  }
  // data - 新增数据项
  newTemplate = (data,allData) => {
    console.log(data,allData);
  };
  // data - 删除 数据项
  deleteTemplate = (data) => {
    console.log(data);
  };
  // 选择模板
  getTemplate = (data) => {
    const { type } = this.state.templateObj;
    const { content } = data;
    console.log(type);
    switch(type) {
      case 'zz':
        this.setState({chief_complaint: content});
        break;
      case 'xb':
        this.setState({medical_history: content});
        break;
      case 'zd':
        this.setState({diagnosi: content});
        break;
      case 'cl':
        this.setState({treatment: content});
        break;
      case 'rs':
        this.setState({chromosome: content});
        break;
      case 'qt':
        this.setState({other: content});
        break;
      default:
        console.log('type error');
    }
    this.closeModal();
  }

  adjustOrder = (key,acitonType) => {
    // 请求服务器，调整后重新获取.......
    console.log(key,acitonType);
  };

  render() {
    const { treeList, uFetusActiveKey, currentTreeKeys, formType  } = this.state;
    const { isShowTemplateModal, templateList } = this.state.templateObj;
    // data
    const { chief_complaint, medical_history, diagnosis, treatment, other_exam, karyotype } = this.state;
    const { pregnancy_history, downs_screen, thalassemia, ultrasound, past_medical_history, family_history, physical_check_up } = this.state;
    const tableColumns = [
      {title: '编号', key: 'index', render: (_,__,index) => (<span>{index+1}</span>) },
      {title: '内容', dataIndex: 'content', key: 'content'},
    ];

    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="fuzhen-left ant-col-5">
          <div style={{textAlign: 'center'}}>
            <Button size="small" onClick={this.newSpecialistemr}>新增病历</Button>
          </div>
          <div>
            {this.renderTree(treeList)}
          </div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7">
          {/* NOTICE 暂时这样写 可能不太适当 */}
          {Number(currentTreeKeys[0])  < 0 ? (
            <ButtonGroup>
              <Button type={formType === "1" ? "primary" : ""} onClick={() => this.handleBtnChange('1')}>胎儿疾病</Button>
              <Button type={formType === "2" ? "primary" : ""} onClick={() => this.handleBtnChange('2')}>遗传门诊</Button>
              <Button type={formType === "3" ? "primary" : ""} onClick={() => this.handleBtnChange('3')}>复诊记录</Button>
            </ButtonGroup>
          ) : null}
          { formType === "1" ? (
            <div>
              <Collapse defaultActiveKey={['fetus-0','fetus-1','fetus-2','fetus-3','fetus-4','fetus-5','fetus-6','fetus-7','fetus-8','fetus-9','fetus-10','fetus-11']}>
                <Panel header="主诉" key="fetus-0">{formRender({chief_complaint: chief_complaint},this.chief_complaint_config(),() => console.log('c'))}</Panel>
                <Panel header="预产期" key="fetus-1">{formRender(pregnancy_history, this.pregnancy_history_config(), () => console.log('p'))}</Panel>
                <Panel header="现病史" key="fetus-2">{formRender({medical_history: medical_history},this.medical_history_config(),() => console.log('c'))}</Panel>
                <Panel header="唐氏筛查" key="fetus-3">
                  {formRender(downs_screen['early'], this.early_downs_screen_config(), () =>console.log('down_screen'))}
                  {formRender(downs_screen['middle'], this.middle_downs_screen_config(), () =>console.log('down_screen'))}
                  {formRender(downs_screen['nipt'], this.NIPT_downs_screen_config(), () =>console.log('down_screen'))}
                </Panel>
                <Panel header="地贫/血型检查" key="fetus-4">
                  {formRender(thalassemia['wife'], this.wife_thalassemia(), () =>console.log('地贫'))}
                  {formRender(thalassemia['husband'], this.husband_thalassemia(), () =>console.log('地贫'))}
                </Panel>
                <Panel header="超声检查" key="fetus-5">
                  <div>
                    {formRender({menopause: ultrasound['menopause']}, this.ultrasound_menopause_config(), () => console.log('超声'))}
                  </div>
                  <div>
                    <Tabs
                      activeKey={uFetusActiveKey}
                      type="editable-card"
                      onEdit={this.handleUFetusEdit}
                    >
                      {this.renderUFetusTabPane(ultrasound['fetus'] || [])}
                    </Tabs>
                  </div>
                </Panel>
                <Panel header="其他检查" key="fetus-6">{formRender({other_exam: other_exam},this.other_exam_config(),() => console.log('c'))}</Panel>
                <Panel header="既往史" key="fetus-7">
                  {formRender(past_medical_history, this.past_medical_history_config(),() => console.log('既往史') )}
                </Panel>
                <Panel header="家族史" key="fetus-8">
                  {formRender(family_history, this.family_history_config(), () => console.log('家族史'))}
                </Panel>
                <Panel header="体格检查" key="fetus-9">
                  {formRender(physical_check_up, this.physical_check_up_config(), () => console.log('tige'))}
                </Panel>
                <Panel header="诊断" key="fetus-10">{formRender({diagnosis: diagnosis}, this.diagnosis_config(),() => console.log('c'))}</Panel>
                <Panel header="处理" key="fetus-11">{formRender({treatment: treatment}, this.treatment_config(),() => console.log('c'))}</Panel>
              </Collapse>
            </div>
          ) : null }
          { formType === "2" ? (
            <div>
              <Collapse defaultActiveKey={['genetic-0','genetic-1','genetic-2','genetic-3','genetic-4','genetic-5','genetic-6','genetic-7','genetic-8','genetic-9']}>
                <Panel header="主诉" key="genetic-0">{formRender({chief_complaint: chief_complaint},this.chief_complaint_config(),() => console.log('c'))}</Panel>
                <Panel header="预产期" key="genetic-1">{formRender(pregnancy_history, this.pregnancy_history_config(), () => console.log('p'))}</Panel>
                <Panel header="现病史" key="genetic-2">{formRender({medical_history: medical_history},this.medical_history_config(),() => console.log('c'))}</Panel>
                <Panel header="地贫/血型检测" key="genetic-3">
                  {formRender(thalassemia['wife'], this.wife_thalassemia(), () =>console.log('地贫'))}
                  {formRender(thalassemia['husband'], this.husband_thalassemia(), () =>console.log('地贫'))}
                </Panel>
                <Panel header="染色体核型" key="genetic-4">{formRender({karyotype: karyotype} , this.karyotype_config(), () => console.log('a'))}</Panel>
                <Panel header="其他检查" key="genetic-5">{formRender({other_exam: other_exam}, this.other_exam_config(),() => console.log('c'))}</Panel>
                <Panel header="既往史" key="genetic-6">{formRender(past_medical_history, this.past_medical_history_config(),() => console.log('c'))}</Panel>
                <Panel header="家族史" key="genetic-7">{formRender(family_history,this.family_history_config(),() => console.log('c'))}</Panel>
                <Panel header="诊断" key="genetic-8">{formRender({diagnosis: diagnosis},this.diagnosis_config(),() => console.log('c'))}</Panel>
                <Panel header="处理" key="genetic-9">{formRender({treatment: treatment},this.treatment_config(),() => console.log('c'))}</Panel>
              </Collapse>
            </div>
          ) : null}
          { formType === "3" ? (
            <div>
              <Collapse defaultActiveKey={['fuzhen-0','fuzhen-1','fuzhen-2','fuzhen-3','fuzhen-4','fuzhen-5','fuzhen-6']}>
                {/* 这个位置的数据可能和上边的不一样 */}
                <Panel header="复诊日期+孕周" key="fuzhen-0"/>
                <Panel header="主诉" key="fuzhen-1">{formRender({},this.chief_complaint_config(),() => console.log('c'))}</Panel>
                <Panel header="病情变化" key="fuzhen-2">{formRender({},this.stateChange_config(),() => console.log('c'))}</Panel>
                <Panel header="体格检查" key="fuzhen-3">{formRender({},this.physical_check_up_config(),() => console.log('c'))}</Panel>
                <Panel header="前次检查结果" key="fuzhen-4">{formRender({},this.lastResult_config(),() => console.log('c'))}</Panel>
                <Panel header="诊断" key="fuzhen-5">{formRender({},this.diagnosis_config(),() => console.log('c'))}</Panel>
                <Panel header="处理" key="fuzhen-6">{formRender({},this.treatment_config(),() => console.log('c'))}</Panel>
              </Collapse>
            </div>
          ) : null}
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