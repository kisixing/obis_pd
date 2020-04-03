import React, { Component } from 'react';
import store from '../store';

import { Tree, Tabs, Collapse, Modal, Button, Checkbox, message } from 'antd';
import formRender, { fireForm } from '../../render/form';
import Page from '../../render/page';
import TemplateInput from '../../components/templateInput';
import mdConfig from './formRenderConfig';

import { newDataTemplate } from './data';
import { convertString2Json, mapValueToKey, formatDate } from '../../utils/index';
import service from "../../service";
import './index.less';
import '../index.less';

const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const ButtonGroup = Button.Group;

// 展开所有
const defaultActiveKeys = [
  'fetus-0', 'fetus-1', 'fetus-2', 'fetus-3', 'fetus-4', 'fetus-5', 'fetus-6', 'fetus-7', 'fetus-8', 'fetus-9', 'fetus-10', 'fetus-11',
  'genetic-0', 'genetic-1', 'genetic-2', 'genetic-3', 'genetic-4', 'genetic-5', 'genetic-6', 'genetic-7', 'genetic-8', 'genetic-9',
  'fuzhen-0', 'fuzhen-1', 'fuzhen-2', 'fuzhen-3', 'fuzhen-4', 'fuzhen-5', 'fuzhen-6'
]
/**
 * 专科病例页面备注
 * 1.新建时（包括病例和胎儿） 
 *  都使用一个random的负数表示，病例使用负整数，胎儿使用负小数
 *  皆使用number类型，与服务器数据比较时有可能需要toString()
 *  currentTreeKeys 永远为string类型
 */
export default class MedicalRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //树形list相关
      specialistemrList: [],  // 左侧病历树形菜单
      currentExpandedKeys: [], // 当前展开的树形菜单
      currentTreeKeys: [],  // 当前选择的树节点的key - 永远是string 仅可选中一个
      
      // data
      newSpecialistemrData: [], // 新建病历的数据
      currentSpcialistemrData: {}, // 当前病历数据
      
      ultrasoundMiddleData: [], // 中孕超声数据
      operationHistoryData: [], // 胎儿疾病 - 手术史数据
      /* control */
      uFetusActiveKey: '-1',  // 胎儿疾病 - 超声检查 Tab
      cFetusActiveKey: '0', // 体格检查 - 先露/胎心率 Tab
      isDownsScreenChecked: true,
      isThalassemiaChecked: true,
      isUltrasoundChecked: true,
      // 模板功能
      templateObj: {
        isShowTemplateModal: false,
        type: '',
        doctor: ''
      },
    }
  }

  componentDidMount() {
    const { userData } = store.getState();
    if(userData.userid){
      service.medicalrecord.getspecialistemr().then(res => this.setState({ specialistemrList: res.object.list }));
    }else{
      message.info('用户为空');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(prevState);
  }

  /* ========================= 事件交互类 =========================== */
  // 树形结构选择 -- 
  handleTreeSelect = (selectedKeys, { selected, node }) => {
    // 禁用取消
    if (!selected) {  return; };
    // 父节点，展开或收起
    if (node.props.children) {
      let currentExpandedKeys = this.state.currentExpandedKeys.concat();
      const nodeKey = node.props['eventKey'];
      const i = currentExpandedKeys.findIndex(key => key === nodeKey);
      if (i !== -1) {
        currentExpandedKeys.splice(i, 1);
      } else {
        currentExpandedKeys.push(nodeKey);
      }
      this.setState({currentExpandedKeys});
      return;
    }
    // 新建病历
    if (Number(selectedKeys[0]) < 0) {
      const curData = this.state.newSpecialistemrData.find(v => v.id === selectedKeys[0]); 
      this.setState({ currentTreeKeys: selectedKeys, currentSpcialistemrData: curData });
      return;
    };
    // 获取病历详情
    service.medicalrecord.getspecialistemrdetail({ recordid: selectedKeys[0] }).then(res => {
      // 获取已经整合的数据
      const obj = this.convertSpecialistemrDetail(res.object);
      this.setState({ currentTreeKeys: selectedKeys, currentSpcialistemrData: obj });
    });
    service.ultrasound.getPrenatalPacsMg({ recordid: selectedKeys[0] }).then(res => this.setState({ultrasoundMiddleData: res.object}));
    service.medicalrecord.getOperationHistory().then(res => this.setState({ operationHistoryData: res.object}));
  };

  // 设置新建病历的formType --
  handleBtnChange = (key) => {
    const { currentTreeKeys, newSpecialistemrData } = this.state;
    const index = newSpecialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    let nDatas = newSpecialistemrData.map(v => v);
    nDatas[index]['formType'] = key;
    this.setState({ newSpecialistemrData: nDatas, currentSpcialistemrData: nDatas[index] });
  };

  // 新建病历 -- 
  newSpecialistemr = () => {
    const { newSpecialistemrData, currentExpandedKeys } = this.state;
    // 树形菜单
    let newSpecialistemrList = this.state.specialistemrList.map(v => v);
    const newId = (0-Math.random()*100|0).toString();
    const todayStr = formatDate();
    const todayIndex = newSpecialistemrList.findIndex(item => item.title === todayStr);
    if (todayIndex === -1) {
      // 以往的记录不是今天 || 病例为空
      newSpecialistemrList.splice(0, 0, { title: todayStr, key: "n-1", children: [{ title: "待完善病历", key: newId }] });
      currentExpandedKeys.push("n-1");
    } else {
      newSpecialistemrList[todayIndex]['children'].splice(0, 0, { title: '待完善病历', key: newId });
      currentExpandedKeys.push(newSpecialistemrList[todayIndex].key);
    }
    // 数据实体
    const { openCaseData, userData } = store.getState();
    let newData = Object.assign({}, newDataTemplate);
    newData['id'] = newId;
    newData['formType'] = "1";
    newData['pregnancy_history']['gravidity'] = openCaseData['gravidity'];
    newData['pregnancy_history']['parity'] = openCaseData['parity'];
    newData['pregnancy_history']['lmd'] = openCaseData['lmd'];
    newData['pregnancy_history']['edd'] = openCaseData['edd'];
    newData['physical_check_up']['pre_weight'] = openCaseData['pre_weight'];
    newData['physical_check_up']['current_weight'] = openCaseData['current_weight'];
    newData['physical_check_up']['weight_gain'] = openCaseData['weight_gain'];
    newData['ckweek'] = userData['tuserweek'];
    newData['createdate'] = todayStr;

    newSpecialistemrData.push(newData);
    // 将formType设置为空 用户选择
    this.setState({specialistemrList: newSpecialistemrList,
      currentTreeKeys: [newId],
      newSpecialistemrData,
      currentExpandedKeys,
      currentSpcialistemrData: newData
    });
  };
  
  // fetusTab --
  handleTabsClick = (key, type) => {
    if(type === 'u'){
      this.setState({ uFetusActiveKey: key });
    }else if(type === 'c'){
      this.setState({ cFetusActiveKey: key });
    }
  };

  // 超声 婴儿 onEdit --
  handleUFetusEdit = (targetKey, action) => {
    console.log(action);
    const { newSpecialistemrData, currentTreeKeys, currentSpcialistemrData } = this.state;
    const index = newSpecialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    const nS = JSON.parse(JSON.stringify(currentSpcialistemrData));
    if (action === 'remove') {
      const uIndex = nS.ultrasound.fetus.findIndex(v => v.id.toString() === targetKey);
      nS.ultrasound.fetus[uIndex].deleteOperation = "1"; 
      nS.ultrasound.fetus[uIndex].isHidden = true; 
    } else if (action === 'add') {
      if(nS.hasOwnProperty('ultrasound')){
        if(!nS['ultrasound'].hasOwnProperty('fetus') || !Object.prototype.toString.call(nS['ultrasound']['fetus']) === '[object Array]'){
          nS['ultrasound']['fetus'] = [];
        }
      }else{
        nS['ultrasound'] = {};
        nS['ultrasound']['fetus'] = [];
      }
      nS.ultrasound.fetus.push({ id: (-Math.random()).toString, userId: currentSpcialistemrData.userid});
    }
    this.setState({ currentSpcialistemrData: nS});
    if(Number(currentTreeKeys[0]) < 0){
      newSpecialistemrData.splice(index,1,nS);
      this.setState({newSpecialistemrData});
    }
  };

  handleCFetusEdit = (targetKey, action) => {
    console.log(action);
    const { newSpecialistemrData, currentTreeKeys, currentSpcialistemrData } = this.state;
    const index = newSpecialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    const nS = JSON.parse(JSON.stringify(currentSpcialistemrData));
    console.log(targetKey);
    if (action === 'remove') {
      nS['physical_check_up']['fetusCheckUp'].splice(targetKey,1);
    } else if (action === 'add') {
      if(nS.hasOwnProperty('physical_check_up')){
        if(!nS['physical_check_up'].hasOwnProperty('fetusCheckUp') || !(Object.prototype.toString.call(nS['physical_check_up']['fetusCheckUp']) === '[object Array]')){
          nS['physical_check_up']['fetusCheckUp'] = [];
        }
      }else{
        nS['physical_check_up'] = {};
        nS['physical_check_up']['fetusCheckUp'] = [];
      }
      nS['physical_check_up']['fetusCheckUp'].push({});
    }
    this.setState({ currentSpcialistemrData: nS},() => console.log(this.state.currentSpcialistemrData));
    if(Number(currentTreeKeys[0]) < 0){
      newSpecialistemrData.splice(index,1,nS);
      this.setState({newSpecialistemrData});
    }
  };


  // 处理form表单变化 公共处理 -
  // TODO 修改组件后必须改 - 暂时手动传入父键名
  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, name, value, error) => {
    if(error) {
      message.error(error);
      return;
    }
    const { newSpecialistemrData, currentTreeKeys, currentSpcialistemrData } = this.state;
    const index = newSpecialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    let obj = JSON.parse(JSON.stringify(currentSpcialistemrData));

    if (path === "") {
      // 为第一层值
      mapValueToKey(obj, name, value);
    } else {
      switch (name) {
        case 'bp':
          if (value["0"]) { name = 'systolic_pressure'; mapValueToKey(obj, `${path}.${name}`, value["0"]); }
          if (value["1"]) { name = 'diastolic_pressure'; mapValueToKey(obj, `${path}.${name}`, value["1"]); }
          break;
        case 'current_weight':
          // 判断是否有此值
          if(!obj['physical_check_up'].hasOwnProperty('pre_weight')){obj['pre_weight']['pre_weight'] = ''};
          if(obj['physical_check_up']['pre_weight'] !== '' ) {
            const weight_gain = Number(value) - Number(obj['physical_check_up']['pre_weight']);
            obj['physical_check_up']['weight_gain'] = weight_gain.toString();
          }
          obj['physical_check_up'][name] = value;
          break;
        case 'pre_weight':
          // 判断是否有此值
          if(!obj['physical_check_up'].hasOwnProperty('current_weight')){obj['physical_check_up']['current_weight'] = ''};
          if(obj['physical_check_up']['current_weight'] !== '' ) {
            const weight_gain = Number(obj['physical_check_up']['current_weight']) - Number(value); 
            obj['physical_check_up']['weight_gain'] = weight_gain.toString();
          }
          obj['physical_check_up'][name] = value;
          break;
        default:
          mapValueToKey(obj, `${path}.${name}`, value);
      }
    }
    this.setState({currentSpcialistemrData: obj });
    if(Number(currentTreeKeys) < 0) {
      newSpecialistemrData.splice(index,1,obj);
      this.setState({ newSpecialistemrData});
    }
  };

  // 表单保存 - --
  handleSave = () => {
    const { currentTreeKeys,  currentSpcialistemrData, ultrasoundMiddleData, operationHistoryData } = this.state;
    const FORM_BLOCK = "form-block";
    fireForm(document.getElementById(FORM_BLOCK), 'valid').then(validCode => {
      if (validCode) {
        // 保存
        // 整合bp的格式
        const { formType } = currentSpcialistemrData;
        currentSpcialistemrData['physical_check_up']['bp'] = '0'; 
        if(!currentSpcialistemrData.hasOwnProperty('downs_screen')) {
          currentSpcialistemrData['downs_screen'] = {};
        }
        if(!currentSpcialistemrData.hasOwnProperty('thalassemia')) {
          currentSpcialistemrData['thalassemia'] = {};
        }
        if(!currentSpcialistemrData.hasOwnProperty('physical_check_up')) {
          currentSpcialistemrData['physical_check_up'] = {};
        }
        if(formType === '1') {
          currentSpcialistemrData.ultrasound.fetus.forEach(v => {
            if(Number(v.id) < 0) {
              v.id = "";
            }
          })
        }
        // 新建置空
        if(currentSpcialistemrData.id < 0) {
          currentSpcialistemrData.id = "";
        }
        // console.log(currentSpcialistemrData);
        // return;
        // 专科病历主体保存
        service.medicalrecord.savespecialistemrdetail(currentSpcialistemrData).then(res => {
          console.log(res);
          if(res.code === "200") {
            message.success('成功保存');
            service.medicalrecord.getspecialistemr().then(res => {
              if (res.code === "200" || res.code === 200) {
                this.setState({ specialistemrList: res.object.list, currentTreeKeys: [] , currentSpcialistemrData: {} }, () => { })
              }
            });
          }
        }).catch(err => console.log(err));
        // TODO 暂时不保存 手术
        ultrasoundMiddleData.forEach((v) => {
          if(Number(v.docUniqueid) < 0){
            v.docUniqueid = "";
          };
        });
        operationHistoryData.forEach((v) => {
          v.userid = operationHistoryData.userid;
          if(Number(v.docUniqueid) < 0){
            v.docUniqueid = "";
          };
        });
        service.ultrasound.writePrenatalPacsMg({ pacsMgVOList: ultrasoundMiddleData, recordid: currentTreeKeys[0] }).then(res => console.log(res));
        service.medicalrecord.writeOperationHistory({operationHistorys: operationHistoryData }).then(res => console.log(res));
      } else {
        // 提示
        message.error('请填写所有必填信息后再次提交');
      }
    })
  };

  // 处理隐藏按钮的事件 -- 
  handleCheckBox = (checked, name) => {
    const { newSpecialistemrData, currentTreeKeys, currentSpcialistemrData } = this.state;
    const i = newSpecialistemrData.findIndex(v => v.id === currentTreeKeys[0]);
    const nS = JSON.parse(JSON.stringify(currentSpcialistemrData));
    console.log(checked);
    console.log(name);
    if(checked){
      switch(name){
        case 'u':
          nS.ultrasound['fetus'].forEach(v => { v.deleteOperation = "1"; v.isHidden = true; });
          nS.ultrasound.menopause = '';
          this.setState({isUltrasoundChecked: !checked, ultrasoundMiddleData: [], currentSpcialistemrData: nS});
          break;
        case 't':
          nS.thalassemia.wife = {genotype:[]};
          nS.thalassemia.husband = {genotype:[]};
          this.setState({isThalassemiaChecked: !checked, currentSpcialistemrData: nS});
          break;
        case 'd':
          nS.downs_screen = {early: {}, middle: {}, nipt: {}};
          this.setState({isDownsScreenChecked: !checked, currentSpcialistemrData: nS});
          break;
      }
    }else{
      switch(name){
        case 'u':
          this.setState({isUltrasoundChecked: !checked});
          break;
        case 't':
          this.setState({isThalassemiaChecked: !checked});
          break;
        case 'd':
          this.setState({isDownsScreenChecked: !checked});
          break;
      }
    }

    this.setState({currentSpcialistemrData: nS },() => console.log(this.state));
    if(Number(currentTreeKeys) < 0){
      newSpecialistemrData.splice(i,1,nS);
      this.setState({newSpecialistemrData},() => console.log(this.setState));
    }
  }

  /**
   * TODO 未解决
   */

  // 处理中孕超声修改 只处理删除 ，在handleSave统一处理增加和修改
  handleUltraSoundMiddleEdit =  (newData) => {
    const { ultrasoundMiddleData } = this.state;
    let oldData = ultrasoundMiddleData;
    // 1.遍历新数据 - 用于新增
    for(let i = 0 ; i < newData.length; i++){
      if(newData[i].docUniqueid === "" || !newData[i].docUniqueid){
        console.log('新建'); // 新建
        newData[i].docUniqueid = `-${Math.random()}`;
        newData[i].writeOperationType = "0";
        newData[i].isShow = true;
        break;
      }
    }
    let index = -1;
    // 遍历旧数据 删除与修改
    for(let j = 0; j < oldData.length; j++){
      let isFind = false,index = -1;
      for(let i = 0 ; i< newData.length ; i++){
        if(oldData[j].docUniqueid === newData[i].docUniqueid) {
          index = i;
          isFind = true;
          break;
        }
      }
      if(!isFind){
        oldData[j].writeOperationType = "2";
        oldData[j].isShow = false;
        newData.push(oldData[j]);
      }else if(isFind && Number(newData[index].docUniqueid) > 0) {
        oldData[j].writeOperationType = "1";
        oldData[j].isShow = true;
        newData.splice(index, 1, oldData[j]);
      }
    }
    this.setState({ultrasoundMiddleData: newData});
  }

  // 处理手术记录输入
  handleOperationEdit = (newData) => {
    const { operationHistoryData } = this.state;
    let oldData = operationHistoryData;
    // 1.遍历新数据 - 用于新增
    for(let i = 0 ; i < newData.length; i++){
      if(newData[i].docUniqueid === "" || !newData[i].docUniqueid){
        console.log('新建'); // 新建
        newData[i].docUniqueid = `-${Math.random()}`;
        newData[i].writeOperationType = "0";
        newData[i].isShow = true;
        break;
      }
    }
    let index = -1;
    // 遍历旧数据 删除与修改
    for(let j = 0; j < oldData.length; j++){
      let isFind = false;
      for(let i = 0 ; i< newData.length ; i++){
        if(oldData[j].docUniqueid === newData[i].docUniqueid) {
          isFind = true;
          index = j;
          break;
        }
      }
      if(!isFind){
        oldData[j].writeOperationType = "2";
        oldData[j].isShow = false;
        newData.push(oldData[j]);
      }else if(isFind && Number(newData[index].docUniqueid) > 0) {
        oldData[j].writeOperationType = "1";
        oldData[j].isShow = true;
        newData.splice(index, 1, oldData[j]);
      }
    }
    this.setState({operationHistoryData: newData});
  }
  /* ========================= 渲染方法 ============================== */
  // 渲染左侧记录树 - 二级
  renderTree = (data) => (
    <Tree
      onSelect={this.handleTreeSelect}
      defaultExpandAll
      selectedKeys={this.state.currentTreeKeys || []}
      expandedKeys={this.state.currentExpandedKeys || []}
    >
      {data.map(v => (
        <TreeNode title={v.title.slice(0,12)} key={v.key}>
          {v.children.map(u => (
            <TreeNode title={Number(u.key) < 0 ? <span style={{color:'red'}}>{u.title}</span> : u.title} key={u.key} />
          ))}
        </TreeNode>
      ))}
    </Tree>
  );
  
  // 渲染btnGroup
  renderBtn = (formType) => (
    <ButtonGroup>
      <Button type={formType === "1" ? "primary" : ""} onClick={() => this.handleBtnChange('1')}>胎儿疾病</Button>
      <Button type={formType === "2" ? "primary" : ""} onClick={() => this.handleBtnChange('2')}>遗传门诊</Button>
      <Button type={formType === "3" ? "primary" : ""} onClick={() => this.handleBtnChange('3')}>复诊记录</Button>
    </ButtonGroup>
  )
  // 表单渲染
  renderForm = (renderData) => {
    const { formType } = renderData;
    const { 
      chief_complaint, medical_history, other_exam, diagnosis, treatment, karyotype, stateChange, lastResult,
      downs_screen, thalassemia, ultrasound, past_medical_history, family_history, physical_check_up, pregnancy_history,
      ckweek, createdate
    } = renderData;
    const { isDownsScreenChecked, isThalassemiaChecked, isUltrasoundChecked, uFetusActiveKey, ultrasoundMiddleData, operationHistoryData } = this.state;
    switch(formType){
      case '1':
        return (
          // <div>
          //   <div>{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</div>
          //   <div>{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_, { name, value, error }) => this.handleFormChange("pregnancy_history", name, value, error))}</div>
          //   <div>{formRender({ medical_history: medical_history }, mdConfig.medical_history_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</div>
          //   <div>
          //     <Checkbox checked={!isDownsScreenChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'd')}>未检查</Checkbox>
          //       {!isDownsScreenChecked ? null : (
          //         <div>
          //           {formRender(downs_screen.hasOwnProperty('early') ? downs_screen['early'] : {}, mdConfig.early_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.early", name, value, error))}
          //           {formRender(downs_screen.hasOwnProperty('middle') ? downs_screen['middle'] : {}, mdConfig.middle_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.middle", name, value, error))}
          //           {formRender(downs_screen.hasOwnProperty('nipt') ? downs_screen['nipt'] : {}, mdConfig.NIPT_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.nipt", name, value, error))}
          //         </div>
          //       )}
          //   </div>
          //   <div>
          //     <Checkbox checked={!isThalassemiaChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 't')}>未检查</Checkbox>
          //       {!isThalassemiaChecked ? null : (
          //         <div>
          //           {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.wife", name, value, error))}
          //           {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {}, mdConfig.husband_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.husband", name, value, error))}
          //         </div>
          //       )}
          //   </div>
          //   <div>
          //     <Checkbox checked={!isUltrasoundChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'u')}>未检查</Checkbox>
          //       {!isUltrasoundChecked ? null : (
          //         <div>
          //           <div>{formRender({ menopause: ultrasound['menopause'] }, mdConfig.ultrasound_menopause_config(), (_, { name, value, error }) => this.handleFormChange("ultrasound", name, value, error))}</div>
          //           <div>
          //             <Tabs
          //               activeKey={uFetusActiveKey}
          //               onTabClick={(key) => this.handleTabsClick(key,'u')}
          //               type="editable-card"
          //               onEdit={this.handleUFetusEdit}
          //             >{this.renderUFetusTabPane(ultrasound['fetus'])}</Tabs>
          //           </div>
          //           <div>
          //             {/*  中孕超声  */}
          //             {formRender({ middle: ultrasoundMiddleData }, mdConfig.middle_config(), (_, { value }) => this.handleUltraSoundMiddleEdit(value))}
          //           </div>
          //         </div>
          //       )}
          //   </div>
          //   <div>
          //     {formRender({ other_exam: other_exam }, mdConfig.other_exam_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}
          //   </div>
          //   <div>
          //     <div>
          //         {formRender(past_medical_history, mdConfig.past_medical_history_config(), (_, { name, value, error }) => this.handleFormChange("past_medical_history", name, value, error))}
          //       </div>
          //       <div>
          //         {formRender({ operation_history: operationHistoryData }, mdConfig.operation_history_config(), (_, { value }) => this.handleOperationEdit(value))}
          //       </div>
          //   </div>
          //   <div>
          //     {formRender(family_history, mdConfig.family_history_config(), (_, { name, value, error }) => this.handleFormChange("family_history", name, value, error))}
          //   </div>
          //   <div>
          //     <div>
          //         {formRender(physical_check_up, mdConfig.physical_check_up_config(), (_, { name, value, error }) => this.handleFormChange("physical_check_up", name, value, error))}
          //       </div>
          //       <div>
          //         <div>
          //           <Tabs
          //             activeKey={this.state.cFetusActiveKey}
          //             onTabClick={(key) => this.handleTabsClick(key,'c')}
          //             type="editable-card"
          //             onEdit={this.handleCFetusEdit}
          //           >{this.renderCFetusTabPane(physical_check_up.fetusCheckUp)}</Tabs>
          //         </div>
          //       </div>
          //   </div>
          //   <div>
          //     {formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}
          //   </div>
          //   <div>
          //     {formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}
          //   </div>
          // </div>

          <Collapse defaultActiveKey={defaultActiveKeys}>
            <Panel header="主诉" key="fetus-0">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="预产期" key="fetus-1">{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_, { name, value, error }) => this.handleFormChange("pregnancy_history", name, value, error))}</Panel>
            <Panel header="现病史" key="fetus-2">{formRender({ medical_history: medical_history }, mdConfig.medical_history_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="唐氏筛查" key="fetus-3">
              <Checkbox checked={!isDownsScreenChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'd')}>未检查</Checkbox>
              {!isDownsScreenChecked ? null : (
                <div>
                  {formRender(downs_screen.hasOwnProperty('early') ? downs_screen['early'] : {}, mdConfig.early_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.early", name, value, error))}
                  {formRender(downs_screen.hasOwnProperty('middle') ? downs_screen['middle'] : {}, mdConfig.middle_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.middle", name, value, error))}
                  {formRender(downs_screen.hasOwnProperty('nipt') ? downs_screen['nipt'] : {}, mdConfig.NIPT_downs_screen_config(), (_, { name, value, error }) => this.handleFormChange("downs_screen.nipt", name, value, error))}
                </div>
              )}
            </Panel>
            <Panel header="地贫/血型检查" key="fetus-4">
              <Checkbox checked={!isThalassemiaChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 't')}>未检查</Checkbox>
              {!isThalassemiaChecked ? null : (
                <div>
                  {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.wife", name, value, error))}
                  {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {}, mdConfig.husband_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.husband", name, value, error))}
                </div>
              )}
            </Panel>
            <Panel header="超声检查" key="fetus-5">
              <Checkbox checked={!isUltrasoundChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'u')}>未检查</Checkbox>
              {!isUltrasoundChecked ? null : (
                <div>
                  <div>{formRender({ menopause: ultrasound['menopause'] }, mdConfig.ultrasound_menopause_config(), (_, { name, value, error }) => this.handleFormChange("ultrasound", name, value, error))}</div>
                  <div>
                    <Tabs
                      activeKey={uFetusActiveKey}
                      onTabClick={(key) => this.handleTabsClick(key,'u')}
                      type="editable-card"
                      onEdit={this.handleUFetusEdit}
                    >{this.renderUFetusTabPane(ultrasound['fetus'])}</Tabs>
                  </div>
                  <div>
                    {/*  中孕超声  */}
                    {formRender({ middle: ultrasoundMiddleData }, mdConfig.middle_config(), (_, { value }) => this.handleUltraSoundMiddleEdit(value))}
                  </div>
                </div>
              )}
            </Panel>
            <Panel header="其他检查" key="fetus-6">{formRender({ other_exam: other_exam }, mdConfig.other_exam_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="既往史" key="fetus-7">
              <div>
                {formRender(past_medical_history, mdConfig.past_medical_history_config(), (_, { name, value, error }) => this.handleFormChange("past_medical_history", name, value, error))}
              </div>
              <div>
                {formRender({ operation_history: operationHistoryData }, mdConfig.operation_history_config(), (_, { value }) => this.handleOperationEdit(value))}
              </div>
            </Panel>
            <Panel header="家族史" key="fetus-8">{formRender(family_history, mdConfig.family_history_config(), (_, { name, value, error }) => this.handleFormChange("family_history", name, value, error))}</Panel>
            <Panel header="体格检查" key="fetus-9">
              <div>
                {formRender(physical_check_up, mdConfig.physical_check_up_config(), (_, { name, value, error }) => this.handleFormChange("physical_check_up", name, value, error))}
              </div>
              <div>
                <div>
                  <Tabs
                    activeKey={this.state.cFetusActiveKey}
                    onTabClick={(key) => this.handleTabsClick(key,'c')}
                    type="editable-card"
                    onEdit={this.handleCFetusEdit}
                  >{this.renderCFetusTabPane(physical_check_up.fetusCheckUp)}</Tabs>
                </div>
              </div>
              </Panel>
            <Panel header="诊断" key="fetus-10">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="处理" key="fetus-11">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
          </Collapse>
        );
      case '2':
        return (
          <Collapse defaultActiveKey={defaultActiveKeys}>
            <Panel header="主诉" key="genetic-0">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="预产期" key="genetic-1">{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_, { name, value, error }) => this.handleFormChange("pregnancy_history", name, value, error))}</Panel>
            <Panel header="现病史" key="genetic-2">{formRender({ medical_history: medical_history }, mdConfig.medical_history_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="地贫/血型检测" key="genetic-3">
              <Checkbox checked={!isThalassemiaChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 't')}>未检查</Checkbox>
              {!isThalassemiaChecked ? null : (
                <div>
                  {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.wife", name, value, error))}
                  {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {}, mdConfig.husband_thalassemia(), (_, { name, value, error }) => this.handleFormChange("thalassemia.husband", name, value, error))}
                </div>
              )}
            </Panel>
            <Panel header="染色体核型" key="genetic-4">{formRender({ karyotype: karyotype }, mdConfig.karyotype_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="其他检查" key="genetic-5">{formRender({ other_exam: other_exam }, mdConfig.other_exam_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="既往史" key="genetic-6">{formRender(past_medical_history, mdConfig.past_medical_history_config(), (_, { name, value, error }) => this.handleFormChange("past_medical_history", name, value, error))}</Panel>
            <Panel header="家族史" key="genetic-7">{formRender(family_history, mdConfig.family_history_config(), (_, { name, value, error }) => this.handleFormChange("family_history", name, value, error))}</Panel>
            <Panel header="诊断" key="genetic-8">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="处理" key="genetic-9">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
          </Collapse>
        );
      case '3':
        return (
          <Collapse defaultActiveKey={defaultActiveKeys}>
            <Panel header="复诊日期+孕周" key="fuzhen-0">{formRender({ ckweek: ckweek, createdate: createdate || '' }, mdConfig.ckweekAndcreatdate(), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="主诉" key="fuzhen-1">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="病情变化" key="fuzhen-2">{formRender({ stateChange: stateChange }, mdConfig.stateChange_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="体格检查" key="fuzhen-3">
              <div>
                  {formRender(physical_check_up, mdConfig.physical_check_up_config(), (_, { name, value, error }) => this.handleFormChange("physical_check_up", name, value, error))}
                </div>
                <div>
                  <div>
                    <Tabs
                      activeKey={this.state.cFetusActiveKey}
                      onTabClick={(key) => this.handleTabsClick(key,'c')}
                      type="editable-card"
                      onEdit={this.handleCFetusEdit}
                    >{this.renderCFetusTabPane(physical_check_up.fetusCheckUp)}</Tabs>
                  </div>
                </div>
            </Panel>
            <Panel header="前次检查结果" key="fuzhen-4">{formRender({ lastResult: lastResult }, mdConfig.lastResult_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="诊断" key="fuzhen-5">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
            <Panel header="处理" key="fuzhen-6">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value, error }) => this.handleFormChange("", name, value, error))}</Panel>
        </Collapse>
        );
      default:
        return null;
    }
  }

  // 渲染 超声检查 胎儿Tab -- 
  renderUFetusTabPane = (fetusData) => {
    if(fetusData.length === 0) return <div key="none">暂无数据</div>;
    const fetusTabPaneDOM = [];
    fetusData.forEach((fetus, index) => {
      if(!fetus.isHidden) {
        fetusTabPaneDOM.push(
          <TabPane key={fetus.id} tab={`胎儿-${index + 1}`}>
            {formRender(fetus, mdConfig.ultrasound_fetus_config(), (_, { name, value }) => this.handleFormChange(`ultrasound.fetus-${index}`, name, value))}
          </TabPane>
        );
      }
    })
    return fetusTabPaneDOM;
  };

  // 渲染 体格检查 胎儿Tab
  renderCFetusTabPane = (fetusData) => {
    if(!fetusData) return;
    if(fetusData.length === 0) return <div>暂无数据</div>;
    const fetusTabPaneDOM = [];
    fetusData.forEach((fetus, index) => {
      if(!fetus.isHidden) {
        console.log('in');
        fetusTabPaneDOM.push(
          <TabPane key={index} tab={`胎儿-${index + 1}`}>
            {formRender(fetus, mdConfig.fetusCheckUp_config(), (_, { name, value }) => this.handleFormChange(`physical_check_up.fetusCheckUp-${index}`, name, value))}
          </TabPane>
        );
      }
    })
    return fetusTabPaneDOM;
  }

  /* ========================= 其他 ================================== */
  // 获取数据 整合 返回
  convertSpecialistemrDetail = (object) => {
    // 将 存在 "[{"label":"a","value":"b"},{""}]"  这样格式的转一下
    // 既往史 家族史
    if (object.formType !== "3") {
      Object.keys(object['past_medical_history']).forEach(v => {
        if (v !== 'operation_history') object['past_medical_history'][v] = convertString2Json(object['past_medical_history'][v]);
      });
      Object.keys(object['family_history']).forEach(v => object['family_history'][v] = convertString2Json(object['family_history'][v]));
      Object.keys(object['pregnancy_history']).forEach( v => {
        if(v !== 'lmd' && v !== 'edd') {
          object['pregnancy_history'][v] = convertString2Json(object['pregnancy_history'][v]);
        }
      })
    }
    if(object.thalassemia){
      if(object.thalassemia.wife){
        object.thalassemia.wife.genotype = convertString2Json(object.thalassemia.wife.genotype);
      }
      if(object.thalassemia.husband){
        object.thalassemia.husband.genotype = convertString2Json(object.thalassemia.husband.genotype);
      }
    }
    if(object.hasOwnProperty('physical_check_up')){
      object['physical_check_up']['edema'] = convertString2Json(object['physical_check_up']['edema']);
      object['physical_check_up']['fetusCheckUp'] = convertString2Json(object['physical_check_up']['fetusCheckUp']);
      object['physical_check_up'].bp = { "0": object.physical_check_up['systolic_pressure'], "1": object.physical_check_up['diastolic_pressure'] }
    }
    if(object.downs_screen === null) object.downs_screen = {early: {} , middle: {}, nipt: {}};
    if(object.thalassemia === null) object.thalassemia = {wife: {} , husband: {}};
    return object;
  };

  
  /* ============================ 模板功能 ==================================== */
  // 打开modal框 & 根据type值搜索对应模板
  openModal = (type) => {
    if (type) {
      const { currentSpcialistemrData } = this.state;
      const doctor = currentSpcialistemrData.doctor || "";
      this.setState({templateObj: {isShowTemplateModal: true,type: type,doctor: doctor}});
    }
  };
  // 关闭modal框
  closeModal = () => {
    this.setState({
      templateObj: { isShowTemplateModal: false, type: '', doctor: ''}
    })
  };
  // 获取template的输入信息
  getTemplateInput = (items) => {
    const { currentTreeKeys, currentSpcialistemrData, newSpecialistemrData } = this.state;
    const { type } = this.state.templateObj;
    const content = items.map(v => v.content).join(" ");
    const index = newSpecialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    let nS = JSON.parse(JSON.stringify(currentSpcialistemrData));
    switch(type) {
      case 'dmr1':
        nS['chief_complaint'] = content;
        break;
      case 'dmr2':
        nS['medical_history'] = content;
        break;
      case 'dmr3':
        nS['other_exam'] = content;
        break;
      case 'dmr4':
        nS['diagnosis'] = content;
        break;
      case 'dmr5':
        nS['treatment'] = content;
        break;
      case 'dmr6':
        nS['karyotype'] = content;
        break;
      case 'dmr7':
        nS['stateChange'] = content;
        break;
      case 'dmr8':
        nS['lastResult'] = content;
        break;
      default:
        console.log('type error');
        break;
    }
    this.setState({currentSpcialistemrData: nS},() => {this.closeModal();console.log(this.state)});
    if(Number(currentTreeKeys) < 0) {
      newSpecialistemrData.splice(index,1,nS);
      this.setState({newSpecialistemrData});
    }
  }


  render() {
    const { specialistemrList, currentSpcialistemrData ,currentTreeKeys } = this.state;
    const { isShowTemplateModal, doctor, type } = this.state.templateObj;
    const { formType = "" } = currentSpcialistemrData;
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="fuzhen-left ant-col-5">
          <div style={{ textAlign: 'center' }}><Button size="small" onClick={this.newSpecialistemr}>新增病历</Button></div>
          <div>{this.renderTree(specialistemrList)}</div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7" id="form-block">
          {/* 仅当新建时显示 */}
          <div>
            {(Number(currentTreeKeys[0]) < 0) ? this.renderBtn(formType) : null}
          </div>
          {/* 表单主体 className="bgWhite form-block" */}
          <div id="form-block" >
            {this.renderForm(currentSpcialistemrData)}
          </div>
          {/* 操作按钮 */}
          <div>
            {!currentTreeKeys[0] ? null : ( 
              <div className="btn-group pull-right bottom-btn">
                <Button className="blue-btn">打印</Button>
                <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
              </div>) }
          </div>
        </div>
        {/* modal */}
        <Modal
          visible={isShowTemplateModal}
          onCancel={this.closeModal}
          footer={false}
          width="800px"
        >
          <div>
            <TemplateInput
              data={{doctor,type}}
              getData={this.getTemplateInput}
            /> 
          </div>
        </Modal>
      </Page>
    )
  }
}
