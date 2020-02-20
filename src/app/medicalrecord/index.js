import React,{ Component} from 'react';
import {Tree, Tabs, Collapse, Modal, Button, Checkbox, message} from 'antd';

import formRender,{fireForm} from '../../render/form';
import Page from '../../render/page';
import valid from '../../render/common/valid';
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

// 将后台返回的string转为object
const convertString2Json = function(str) {
  const splitKey = "},{";
  let index = str.indexOf(splitKey);
  if(index === -1) {
    try{
      return JSON.parse(str);
    }catch (e){
      console.log('此字符串非json格式数据');
    }
  }
  let len = str.length, resArr = [];
  // 去掉前后的括号
  str = str.substring(1,len-1);
  index = str.indexOf(splitKey);
  while(index !== -1) {
    try{
      resArr.push(JSON.parse(str.substring(0,index+1)));
    }catch (e) {
      console.log('此字符串非json格式数据');
    }
    str = str.substring(index+2, len);
    len = str.length;
    index = str.indexOf(splitKey);
  }
  resArr.push(JSON.parse(str));
  console.log(resArr);
  return resArr;
};

// 根据字符串在一个对象中确定最下层键值
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
  console.log(keyStr);
  if(objectIndex === -1 && arrayIndex === -1) {
    obj[keyStr] = val;
  }else if(objectIndex < arrayIndex || (objectIndex !== -1 && arrayIndex === -1)){
    const nextKey = keyStr.slice(0,objectIndex);
    console.log(nextKey);
    if(!obj.hasOwnProperty(nextKey)) {
      obj[nextKey] = {};
    }
    mapValueToKey(obj[nextKey], keyStr.slice(objectIndex+1, len), val);
  }else{
    // 检查到 - ，是数组，try-catch
    const nextKey = keyStr.slice(0,arrayIndex);
    // 这个位置可能会BUG
    if(Object.prototype.toString.call(obj[nextKey]) !== "[object Array]") {
      obj[nextKey] = [];
    }
    mapValueToKey(obj[nextKey], keyStr.slice(arrayIndex+1, len), val);
  }
}

/**
 * TODO
 * 1、提交保存的功能
 * 2、复诊病历数据
 * 3、新增表单key的自动生成需要另外做，暂定全为-1
 *
 *  大致的页面逻辑理一下
 *   使用 specialistemrList 保存树形结构
 *   使用 specialistemrData 保存病历数据
 *   使用 specialistemrData['formType'] 控制页面的显示表单类型
 *
 */

export default class MedicalRecord extends Component{
  constructor(props) {
    super(props);
    this.state = {
      // data
      specialistemrList: [],  // 左侧病历树形菜单
      specialistemrData: [],  // 病历数据  主键-key
      ultrasoundMiddleData: [],
      /* control */
      currentTreeKeys: '',  // 当前选择的书的key
      uFetusActiveKey: '',  // 胎儿疾病 - 超声检查 Tab
      isDownsScreenChecked: false,
      isThalassemiaChecked: false,
      isUltrasoundChecked: false,
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
        if(res.code === "200" || 200) {
          this.setState({specialistemrList: res.object.list},() => {})
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
          { name: 'chief_complaint[主诉]', type: 'textarea', valid: 'required',span: 16 },
          { name:'chief_complaintBtn[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zz')}
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
          { name: 'medical_history[现病史]', type: 'textarea', valid: 'required', span: 16 },
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
          { name: 'other_exam[其他]', type: 'textarea', valid: 'required', span: 16 },
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
          { name: 'diagnosis[诊断]', type: 'textarea', valid: 'required', span: 16 },
          { name:'diagnosisBtn[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd'), valid: 'required'}
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
          { name: 'treatment[处理措施]', type: 'textarea', valid: 'required', span: 16 },
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
          { name: 'operation_history[手术史]', type: 'table', pagination: false, editable: true, options: baseData.shoushushiColumns },
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
          {name:'fundal_height(cm)[宫@@@高 ]', type:'input', span:8, valid: 'required|number|rang(10,100)'},

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

    ]
  });
  // 中孕超声
  middle_config = () => ({
    step: 1,
    rows:[
      {
        columns:[
          { name: 'middle[中孕超声]', type: 'table', pagination: false, editable: true, options: baseData.BvColumns },
        ]
      },
    ]
  })
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
  ckweekAndcreatdate = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {name: 'createdate[复诊日期]', type: 'date', span: 6},
          {name: 'ckweek[孕周]', type: 'input', span: 6},
        ]
      }
    ]
  })
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
  // 树形结构选择
  handleTreeSelect = (selectedKeys, {selected, node}) => {
    // 这里禁用取消
    if(node.props.children || !selected) {
      console.log('不允许父节点请求,不允许取消');
      return ;
    };
    if(Number(selectedKeys[0]) < 0) {
      console.log('不允许待完善请求');
      this.setState({currentTreeKeys: selectedKeys});
      return ;
    };
    // 换页操作

    // 先请求好数据再setState， 不然render会报错
    // 获取病历详情
    service.medicalrecord.getspecialistemrdetail({recordid: selectedKeys[0]}).then(res => {
      if(res.code === "200" || 200) {
        const { specialistemrData  } = this.state;

        // 获取已经整合的数据
        const obj = this.convertSpecialistemrDetail(res.object);
        if(!this.checkIsGot(specialistemrData,obj)) {
          specialistemrData.push(obj);
        }else{
          const index = specialistemrData.findIndex(item => item.id === obj.id);
          specialistemrData.splice(index,1,obj);
        }
        this.setState({currentTreeKeys: selectedKeys, specialistemrData},() => {});
      }
    });
    service.ultrasound.getPrenatalPacsMg({recordid: selectedKeys[0]}).then(res => {
      if(res.code === "200" || 200){
        this.setState({ultrasoundMiddleData: res.object})
      }
    });
    service.medicalrecord.getOperationHistory().then(res => console.log(res));
  };
  // 新建病历
  newSpecialistemr = () => {
    const ONE_DAY_MS = 86400000;
    const { specialistemrList, specialistemrData } = this.state;
    // 新建 树型记录
    // 判断第一个是否是今天
    const nD = new Date();
    if(specialistemrList.length === 0 || nD.getTime() - Date.parse(specialistemrList[0]['title']) > ONE_DAY_MS) {
      // 以往的记录不是今天 || 病例为空
      let m = nD.getMonth() + 1, d = nD.getDate();
      specialistemrList.splice(0,0,{title: `${nD.getFullYear()}-${m < 10 ? `0${m}`: m}-${d < 1?`0${d}`:d}` , key: "n-1", children: [{title: "待完善病历", key: "-1"}]})
    }else {
      specialistemrList[0]['children'].splice(0,0,{title: '待完善病历', key: "-1"})
    }
    // 新建数据实体
    specialistemrData.push({id: "-1", formType: ''});
    // 将formType设置为空 用户选择
    this.setState({specialistemrList, currentTreeKeys: ["-1"],specialistemrData},() => console.log(this.state));
  };
  // 设置新建病历的formType
  handleBtnChange = (key) => {
    const { currentTreeKeys, specialistemrData  } = this.state;
    const index = specialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    console.log(index);
    console.log(specialistemrData[index]);
    specialistemrData[index]['formType'] = key;
    this.setState({specialistemrData});
  };

  // fetusTab
  handleTabsClick = (key) => (this.setState({uFetusActiveKey: key}));
  // TODO 处理超声婴儿edit
  handleUFetusEdit = (targetKey, action) => {
    const { specialistemrData, currentTreeKeys } = this.state
    const index = specialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    if(action === 'remove') {
      const uIndex = specialistemrData[index].ultrasound.fetus.findIndex(v => v.id === targetKey);
      specialistemrData[index].ultrasound.fetus.splice(uIndex,1);
    }else if(action === 'add'){
      specialistemrData[index].ultrasound.fetus.push({id: Math.random(), userId: specialistemrData.userid});
    }
    this.setState({specialistemrData});
  };


  // 处理form表单变化 公共处理 -
  // TODO 修改组件后必须改 - 暂时手动传入父键名
  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, name, value) => {
    const { specialistemrData, currentTreeKeys} = this.state;
    const index = specialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    if(path === ""){
      // 为第一层值
      mapValueToKey(specialistemrData[index], name, value);
    }else {
      // 手动 特殊处理bp
      if(name === 'bp'){
        if(value["0"]){name = 'systolic_pressure'; mapValueToKey(specialistemrData[index], `${path}.${name}`, value["0"]);}
        if(value["1"]){name = 'diastolic_pressure';mapValueToKey(specialistemrData[index], `${path}.${name}`, value["1"]);}
        // 特殊处理手术史，中孕超声
      }else if(name === "operation_history"){
        console.log(value);
      } else {
        mapValueToKey(specialistemrData[index], `${path}.${name}`, value);
      }
    }
    this.setState({specialistemrData},() => console.log(this.state));
  };

  // 表单保存
  handleSave = () => {
    const { formType, currentTreeKeys, specialistemrData, ultrasoundMiddleData } = this.state;
    const FORM_BLOCK = "form-block";
    fireForm(document.getElementById(FORM_BLOCK),'valid').then(validCode => {
      if(validCode){
        // 保存
        const index = specialistemrData.findIndex(item => item['id'] === currentTreeKeys[0]);
        // 整合bp的格式
        specialistemrData[index]['physical_check_up']['bp'] = '0';
        service.medicalrecord.savespecialistemrdetail(specialistemrData[index]).then(res => {
          if(res.code === "200" && res.message === "OK") {
            message.success('成功保存');
          }else if(res.code === "500"){
            message.error('500 保存失败')
          }
        }).catch(err => console.log(err));
        console.log(ultrasoundMiddleData);
        ultrasoundMiddleData.forEach(v => v.writeOperationType = "1");
        service.ultrasound.writePrenatalPacsMg({pacsMgVOList: ultrasoundMiddleData, recordid:  currentTreeKeys[0]}).then(res => console.log(res));
      }else{
        // 提示
        message.error('请填写所有信息后再次提交');
      }
    })
  };
  /* ========================= 渲染方法 ============================== */
  // 渲染左侧记录树 - 二级
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
            <TreeNode title={v['key'] < 0 ? <span style={{color: 'red'}}>{v['title']}</span> : v['title'] } key={v['key']}/>
          ))}
        </TreeNode>
      )
    });
    return <Tree
      onSelect={this.handleTreeSelect}
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
          {/*// TODO 这里的处理需要另外做*/}
          {formRender(fetus,this.ultrasound_fetus_config(),(_,{name, value}) => this.handleFormChange(`ultrasound.fetus-${index}`,name, value))}
        </TabPane>
      );
    })
    return fetusTabPaneDOM;
  };

  /* ========================= 其他 ================================== */
  // 获取数据 整合 返回
  convertSpecialistemrDetail = (object) => {
    const {specialistemrData} = this.state;
    // 将 存在 "[{"label":"a","value":"b"},{""}]"  这样格式的转一下
    // 既往史 家族史
    if(object.formType !== "3") {
      let keys = Object.keys(object['past_medical_history']);
      keys.forEach(item => {
        if(item !== 'operation_history'){
          object['past_medical_history'][item] = convertString2Json(object['past_medical_history'][item]) || [];
        }
      });
      keys = Object.keys(object['family_history']);
      keys.forEach(item => {
        object['family_history'][item] = convertString2Json(object['family_history'][item]) || [];
      });
    }

    return object;
  };
  // 检测data中是否存在这个key值
  checkIsGot = (dataList, object) => (
    dataList.findIndex((item) => item['id'] === object['id']) !== -1
  );
  // 根据key值返回对应
  getTargetObject = (dataList, key) => {
    const index = dataList.findIndex(data => (data.id === key ));
    return dataList[index];
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
  };
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
  // 调整位置
  adjustOrder = (key,actionType) => {
    // 请求服务器，调整后重新获取.......
    console.log(key,acitonType);
  };

  render() {
    const { specialistemrList, specialistemrData, uFetusActiveKey, currentTreeKeys  } = this.state;
    const { isDownsScreenChecked, isThalassemiaChecked, isUltrasoundChecked  } = this.state;
    const { ultrasoundMiddleData  } = this.state;
    const { isShowTemplateModal, templateList } = this.state.templateObj;
    // data index用于回调赋值
    const renderData = this.getTargetObject(specialistemrData, currentTreeKeys[0]) || {};
    const { formType } = renderData;
    const { chief_complaint = '', medical_history ='', diagnosis = '', treatment = '', other_exam = '' , karyotype = '', stateChange = '', lastResult = '' } = renderData;
    const {
      pregnancy_history = {},
      downs_screen = {} ,
      thalassemia ={} ,
      ultrasound = {menopause:'' , middle: []},
      past_medical_history = {},
      family_history = {},
      physical_check_up = {},
      ckweek = '', createdate = ''
    } = renderData;
    // 手动修改 physical_check_up bp
    if(Object.keys(physical_check_up).length !== 0) {
      physical_check_up['bp'] = {"0": physical_check_up['systolic_pressure'],"1": physical_check_up['diastolic_pressure']}
    };
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
            {this.renderTree(specialistemrList)}
          </div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7" id="form-block">
          {/* NOTICE 暂时这样写 可能不太适当 */}
          {(Number(currentTreeKeys[0])<0) ? (
            <ButtonGroup>
              <Button type={formType === "1" ? "primary" : ""} onClick={() => this.handleBtnChange('1')}>胎儿疾病</Button>
              <Button type={formType === "2" ? "primary" : ""} onClick={() => this.handleBtnChange('2')}>遗传门诊</Button>
              <Button type={formType === "3" ? "primary" : ""} onClick={() => this.handleBtnChange('3')}>复诊记录</Button>
            </ButtonGroup>
          ) : null}
          { formType === "1" ? (
            <div>
              <Collapse defaultActiveKey={['fetus-0','fetus-1','fetus-2','fetus-3','fetus-4','fetus-5','fetus-6','fetus-7','fetus-8','fetus-9','fetus-10','fetus-11']}>
                <Panel  header="主诉" key="fetus-0">{formRender({chief_complaint: chief_complaint},this.chief_complaint_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="预产期" key="fetus-1">{formRender(pregnancy_history, this.pregnancy_history_config(), (_,{name, value}) => this.handleFormChange("pregnancy_history",name, value))}</Panel>
                <Panel header="现病史" key="fetus-2">{formRender({medical_history: medical_history},this.medical_history_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="唐氏筛查" key="fetus-3">
                  <Checkbox checked={isDownsScreenChecked} onChange={(e) => this.setState({isDownsScreenChecked: e.target.checked})}>未检查</Checkbox>
                  { isDownsScreenChecked ? null : (
                    <div>
                      {formRender(downs_screen.hasOwnProperty('early') ?  downs_screen['early'] : {}, this.early_downs_screen_config(), (_,{name, value}) => this.handleFormChange("downs_screen.early",name, value))}
                      {formRender(downs_screen.hasOwnProperty('middle') ? downs_screen['middle'] : {}, this.middle_downs_screen_config(), (_,{name, value}) => this.handleFormChange("downs_screen.middle",name, value))}
                      {formRender(downs_screen.hasOwnProperty('nipt') ? downs_screen['nipt'] : {}, this.NIPT_downs_screen_config(), (_,{name, value}) => this.handleFormChange("downs_screen.nipt",name, value))}
                    </div>
                  )}
                </Panel>
                <Panel header="地贫/血型检查" key="fetus-4">
                  <Checkbox checked={isThalassemiaChecked} onChange={(e) => this.setState({isThalassemiaChecked: e.target.checked})}>未检查</Checkbox>
                  { isThalassemiaChecked ? null : (
                    <div>
                      {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, this.wife_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.wife",name, value))}
                      {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {} , this.husband_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.husband",name, value))}
                    </div>
                  )}
                </Panel>
                <Panel header="超声检查" key="fetus-5">
                  <Checkbox checked={isUltrasoundChecked} onChange={(e) => this.setState({isUltrasoundChecked: e.target.checked})}>未检查</Checkbox>
                  { isUltrasoundChecked ? null : (
                    <div>
                      <div>
                        {formRender({menopause: ultrasound['menopause']}, this.ultrasound_menopause_config(), (_,{name, value}) => this.handleFormChange("ultrasound",name, value))}
                      </div>
                      <div>
                        <Tabs
                          activeKey={uFetusActiveKey}
                          onTabClick={this.handleTabsClick}
                          type="editable-card"
                          onEdit={this.handleUFetusEdit}
                        >
                          {this.renderUFetusTabPane(ultrasound['fetus'] || [])}
                        </Tabs>
                      </div>
                      <div>
                        {formRender({middle: ultrasoundMiddleData}, this.middle_config(), (_,{value}) => {this.setState({ultrasoundMiddleData: value})})}
                      </div>
                    </div>
                  )}
                </Panel>
                <Panel header="其他检查" key="fetus-6">{formRender({other_exam: other_exam},this.other_exam_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="既往史" key="fetus-7">
                  {formRender(past_medical_history, this.past_medical_history_config(),(_,{name, value}) => this.handleFormChange("past_medical_history",name, value))}
                </Panel>
                <Panel header="家族史" key="fetus-8">
                  {formRender(family_history, this.family_history_config(),(_,{name, value}) => this.handleFormChange("family_history",name, value))}
                </Panel>
                <Panel header="体格检查" key="fetus-9">
                  {formRender(physical_check_up, this.physical_check_up_config(), (_,{name, value}) => this.handleFormChange("physical_check_up",name, value))}
                </Panel>
                <Panel header="诊断" key="fetus-10">{formRender({diagnosis: diagnosis}, this.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="处理" key="fetus-11">{formRender({treatment: treatment}, this.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              </Collapse>
            </div>
          ) : null }
          { formType === "2" ? (
            <div>
              <Collapse defaultActiveKey={['genetic-0','genetic-1','genetic-2','genetic-3','genetic-4','genetic-5','genetic-6','genetic-7','genetic-8','genetic-9']}>
                <Panel header="主诉" key="genetic-0">{formRender({chief_complaint: chief_complaint},this.chief_complaint_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="预产期" key="genetic-1">{formRender(pregnancy_history, this.pregnancy_history_config(), (_,{name, value}) => this.handleFormChange("pregnancy_history",name, value))}</Panel>
                <Panel header="现病史" key="genetic-2">{formRender({medical_history: medical_history},this.medical_history_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="地贫/血型检测" key="genetic-3">
                  {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, this.wife_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.wife",name, value))}
                  {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {} , this.husband_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.husband",name, value))}
                </Panel>
                <Panel header="染色体核型" key="genetic-4">{formRender({karyotype: karyotype} , this.karyotype_config(), (_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="其他检查" key="genetic-5">{formRender({other_exam: other_exam}, this.other_exam_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="既往史" key="genetic-6">{formRender(past_medical_history, this.past_medical_history_config(),(_,{name, value}) => this.handleFormChange("past_medical_history",name, value))}</Panel>
                <Panel header="家族史" key="genetic-7">{formRender(family_history,this.family_history_config(),(_,{name, value}) => this.handleFormChange("family_history",name, value))}</Panel>
                <Panel header="诊断" key="genetic-8">{formRender({diagnosis: diagnosis},this.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="处理" key="genetic-9">{formRender({treatment: treatment},this.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              </Collapse>
            </div>
          ) : null}
          { formType === "3" ? (
            <div>
              <Collapse defaultActiveKey={['fuzhen-0','fuzhen-1','fuzhen-2','fuzhen-3','fuzhen-4','fuzhen-5','fuzhen-6']}>
                {/* 这个位置的数据可能和上边的不一样 */}
                <Panel header="复诊日期+孕周" key="fuzhen-0">{formRender({ckweek: ckweek || '',createdate: createdate || '' }, this.ckweekAndcreatdate(), (_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="主诉" key="fuzhen-1">{formRender({chief_complaint: chief_complaint},this.chief_complaint_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="病情变化" key="fuzhen-2">{formRender({stateChange: stateChange},this.stateChange_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="体格检查" key="fuzhen-3">{formRender(physical_check_up, this.physical_check_up_config(),(_,{name, value}) => this.handleFormChange("physical_check_up",name, value))}</Panel>
                <Panel header="前次检查结果" key="fuzhen-4">{formRender({lastResult: lastResult},this.lastResult_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="诊断" key="fuzhen-5">{formRender({diagnosis: diagnosis},this.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
                <Panel header="处理" key="fuzhen-6">{formRender({treatment: treatment},this.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              </Collapse>
            </div>
          ) : null}

          {currentTreeKeys!=="" ? (
            <div className="btn-group pull-right bottom-btn">
              <Button className="blue-btn">打印</Button>
              <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
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