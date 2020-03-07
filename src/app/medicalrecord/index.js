import React, { Component } from 'react';
import store from '../store';

import { Tree, Tabs, Collapse, Modal, Button, Checkbox, message } from 'antd';
import Page from '../../render/page';

import formRender, { fireForm } from '../../render/form';
import TemplateInput from '../../components/templateInput';
import { GetExpected, convertString2Json, mapValueToKey, formatDate } from '../../utils/index';
import mdConfig from './formRenderConfig';
import { newDataTemplate } from './data';

import service from "../../service";


import './index.less';
import '../index.less';
import * as baseData from './data';

const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const ButtonGroup = Button.Group;

// 应对 输入 b 搜索 β
// 修改后的 提交可能还要改一下
const _genotypeAnemia = baseData.genotypeAnemia.map(item => {
  if (item.value.indexOf('β') >= 0) {
    const { value } = item;
    item.value = value.replace('β', 'b');
  }
  return item;
});


 // 新建数据模型
const newData = {

}
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
      // data
      specialistemrList: [],  // 左侧病历树形菜单
      specialistemrData: [],  // 病历数据  主键-key
      ultrasoundMiddleData: [], // 中孕超声数据
      operationHistoryData: [], // 胎儿疾病 - 手术史数据
      /* control */
      currentTreeKeys: [],  // 当前选择的树节点的key - 永远是string
      currentExpandedKeys: [],
      uFetusActiveKey: '-1',  // 胎儿疾病 - 超声检查 Tab
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
    service.medicalrecord.getspecialistemr().then(res => this.setState({ specialistemrList: res.object.list }));
  }

  /* ========================= 事件交互类 =========================== */
  // 树形结构选择
  handleTreeSelect = (selectedKeys, { selected, node }) => {
    if (node.props.children) {
      // 父节点，展开或收起
      const nodeKey = node.props['eventKey'];
      const { currentExpandedKeys } = this.state;
      const i = currentExpandedKeys.findIndex(key => key === nodeKey);
      if (i !== -1) {
        currentExpandedKeys.splice(i, 1);
      } else {
        currentExpandedKeys.push(nodeKey);
      }
      this.setState({ currentExpandedKeys });
      return;
    }
    // 这里禁用取消
    if (!selected) {  return; };
    if (Number(selectedKeys[0]) < 0) { this.setState({ currentTreeKeys: selectedKeys });return;};
    // 获取病历详情
    service.medicalrecord.getspecialistemrdetail({ recordid: selectedKeys[0] }).then(res => {
      let newSpecialistemrData = this.state.specialistemrData.map(v => v);
      // 获取已经整合的数据
      const obj = this.convertSpecialistemrDetail(res.object);
      const index = newSpecialistemrData.findIndex(v => v.id === obj.id);
      if (index === -1) {
        newSpecialistemrData.push(obj);
      } else {
        newSpecialistemrData.splice(index, 1, obj);
      }
      this.setState({ currentTreeKeys: selectedKeys, specialistemrData: newSpecialistemrData });
    });
    service.ultrasound.getPrenatalPacsMg({ recordid: selectedKeys[0] }).then(res => this.setState({ultrasoundMiddleData: res.object}));
    service.medicalrecord.getOperationHistory().then(res => this.setState({ operationHistoryData: res.object}));
  };

  // 设置新建病历的formType
  handleBtnChange = (key) => {
    const { currentTreeKeys, specialistemrData } = this.state;
    const index = specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    let newSpecialistemrData = specialistemrData.map(v => v);
    newSpecialistemrData[index]['formType'] = key;
    this.setState({ specialistemrData: newSpecialistemrData });
  };

  // 新建病历
  newSpecialistemr = () => {
    const { specialistemrData, currentExpandedKeys } = this.state;
    // 树形菜单
    let newSpecialistemrList = this.state.specialistemrList.map(v => v);
    const newId = 0 - Math.random() * 100 | 0;
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

    newData['ckweek'] = userData['tuserweek'];
    newData['createdate'] = todayStr;

    specialistemrData.push(newData);
    // 将formType设置为空 用户选择
    this.setState({specialistemrList: newSpecialistemrList,
      currentTreeKeys: [newId.toString()],
      specialistemrData,
      currentExpandedKeys
    });
  };
  
  // fetusTab
  handleTabsClick = (key) => (this.setState({ uFetusActiveKey: key }));
  // TODO 处理超声婴儿edit
  handleUFetusEdit = (targetKey, action) => {
    console.log(action);
    const { specialistemrData, currentTreeKeys } = this.state;
    const index = specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    if (action === 'remove') {
      const uIndex = specialistemrData[index].ultrasound.fetus.findIndex(v => v.id.toString() === targetKey);
      specialistemrData[index].ultrasound.fetus[uIndex].deleteOperation = "1"; 
      specialistemrData[index].ultrasound.fetus[uIndex].isHidden = true; 
    } else if (action === 'add') {
      if(specialistemrData[index].hasOwnProperty('ultrasound')){
        if(specialistemrData[index]['ultrasound'].hasOwnProperty('fetus')){

        }else {
          specialistemrData[index]['ultrasound']['fetus'] = [];
        }
      }else{
        specialistemrData[index]['ultrasound'] = {};
        specialistemrData[index]['ultrasound']['fetus'] = [];
      }
      specialistemrData[index].ultrasound.fetus.push({ id: Math.random(), userId: specialistemrData.userid });
    }
    this.setState({ specialistemrData });
  };

  // 处理隐藏按钮的事件
  handleCheckBox = (checked, name) => {
    const { specialistemrData, currentTreeKeys } = this.state;
    const i = specialistemrData.findIndex(v => v.id.toString() === currentTreeKeys[0]);
    if(i === -1) {return;}
    if(checked) {
      let newS = specialistemrData.map(v => v);
      let obj = Object.assign({}, newS[i]);
      switch(name){
        case 'u':
          obj.ultrasound['fetus'].forEach(v => { v.deleteOperation = "1"; v.isHidden = true; });
          obj.ultrasound.menopause = '';
          newS.splice(i,1,obj);
          this.setState({isUltrasoundChecked: !checked, specialistemrData: newS, ultrasoundMiddleData: []});
          break;
        case 't':
          obj.thalassemia.wife = {};
          obj.thalassemia.husband = {};
          newS.splice(i,1,obj);
          this.setState({isThalassemiaChecked: !checked, specialistemrData: newS});
          break;
        case 'd':
          obj.downs_screen = {early: {}, middle: {}, nipt: {}};
          newS.splice(i,1,obj);
          this.setState({isDownsScreenChecked: !checked, specialistemrData: newS});
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
  }

  // 处理form表单变化 公共处理 -
  // TODO 修改组件后必须改 - 暂时手动传入父键名
  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, name, value) => {
    const { specialistemrData, currentTreeKeys } = this.state;
    const index = specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    let obj = JSON.parse(JSON.stringify(specialistemrData[index]));

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
    console.log(obj);
    specialistemrData.splice(index,1,obj);
    this.setState({ specialistemrData: specialistemrData }, () => console.log(this.state));
  };

  // 表单保存 - 未检查
  handleSave = () => {
    const { currentTreeKeys, specialistemrData, ultrasoundMiddleData, operationHistoryData } = this.state;
    const FORM_BLOCK = "form-block";
    fireForm(document.getElementById(FORM_BLOCK), 'valid').then(validCode => {
      if (validCode) {
        // 保存
        const index = specialistemrData.findIndex(item => item['id'].toString() === currentTreeKeys[0]);
        // 整合bp的格式
        specialistemrData[index]['physical_check_up']['bp'] = '0';
        // specialistemrData[index]['id'] = "";
        if(specialistemrData[index].id < 0) {
          specialistemrData[index].id = "";
        }
        if(!specialistemrData[index].hasOwnProperty('downs_screen')) {
          specialistemrData[index]['downs_screen'] = {};
        }
        if(!specialistemrData[index].hasOwnProperty('thalassemia')) {
          specialistemrData[index]['thalassemia'] = {};
        }
        specialistemrData[index].ultrasound.fetus.forEach(v => {
          v.id = "";
        })
        // 专科病历主体保存
        service.medicalrecord.savespecialistemrdetail(specialistemrData[index]).then(res => {
          message.success('成功保存');
          service.medicalrecord.getspecialistemr().then(res => {
            if (res.code === "200" || res.code === 200) {
              this.setState({ specialistemrList: res.object.list }, () => { })
            }
          });
        }).catch(err => console.log(err));
        // 这里要去重
        // ultrasoundMiddleData = [...new Set(ultrasoundMiddleData)];
        for(let i = 0 ; i < ultrasoundMiddleData.length ; i++) {
          if(!ultrasoundMiddleData[i].docUniqueid){
            ultrasoundMiddleData.splice(i,1);
            break;
          }
        }
        for(let i = 0 ; i < operationHistoryData.length ; i++) {
          if(!operationHistoryData[i].docUniqueid){
            operationHistoryData.splice(i,1);
            break;
          }
        }
        // TODO 暂时不保存 手术
        ultrasoundMiddleData.forEach((v) => {if(Number(v.docUniqueid) < 0){v.docUniqueid = "";};});
        operationHistoryData.forEach((v) => {if(Number(v.docUniqueid) < 0){v.docUniqueid = "";};});
        service.ultrasound.writePrenatalPacsMg({ pacsMgVOList: ultrasoundMiddleData, recordid: currentTreeKeys[0] }).then(res => console.log(res));
        // service.medicalrecord.writeOperationHistory({operationHistorys: operationHistoryData}).then(res => console.log(res));
      } else {
        // 提示
        message.error('请填写所有信息后再次提交');
      }
    })
  };

  // 处理隐藏按钮的事件
  handleCheckBox = (checked, name) => {
    const { specialistemrData, currentTreeKeys } = this.state;
    const i = specialistemrData.findIndex(v => v.id.toString() === currentTreeKeys[0]);
    if(i === -1) {return;}
    if(checked) {
      let newS = specialistemrData.map(v => v);
      let obj = Object.assign({}, newS[i]);
      switch(name){
        case 'u':
          obj.ultrasound['fetus'].forEach(v => { v.deleteOperation = "1"; v.isHidden = true; });
          obj.ultrasound.menopause = '';
          newS.splice(i,1,obj);
          this.setState({isUltrasoundChecked: !checked, specialistemrData: newS, ultrasoundMiddleData: []});
          break;
        case 't':
          obj.thalassemia.wife = {};
          obj.thalassemia.husband = {};
          newS.splice(i,1,obj);
          this.setState({isThalassemiaChecked: !checked, specialistemrData: newS});
          break;
        case 'd':
          obj.downs_screen = {early: {}, middle: {}, nipt: {}};
          newS.splice(i,1,obj);
          this.setState({isDownsScreenChecked: !checked, specialistemrData: newS});
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
  }

  /**
   * TODO 未解决
   */

  // 处理中孕超声修改 只处理删除 ，在handleSave统一处理增加和修改
  handleUltraSoundMiddleEdit =  (newData) => {
    const { ultrasoundMiddleData } = this.state;
    let oldData = ultrasoundMiddleData.map(v => JSON.parse(JSON.stringify(v)));
    const oLen = oldData.length;
    const nLen = newData.length;
    for(let i = oLen - 1; i >= 0; i--){
      for(let j = nLen - 1; j >= 0 ; j--){
        // 新建 -- math.random 需要去重
        if(!newData[j].docUniqueid){
          console.log(newData[j]);
          newData[j].docUniqueid =  `-${Math.random()}`;
          newData[j].operationWriteType = "0";
          newData[j].isShow = true;
          oldData.push(newData[j]);
          break;
        }
        // 找到 - 修改
        if(oldData[i].docUniqueid === newData[j].docUniqueid && Number(oldData[i].docUniqueid) > 0){
          newData[j].operationWriteType = "1";
          newData[j].isShow = true;
          oldData[i] = newData[j];
          break;
        }
        // 未找到 - 删除
        if(j === 0 && Number(oldData[i].docUniqueid) > 0){
          oldData[i].operationWriteType = "2";
          oldData[i].isShow = false;
        }
      }
    }
    if(oLen === 0) {
      oldData = newData.map(v => {
        v.operationWriteType = "1";
        v.isShow = true;
        return v;
      })
    }
    if(nLen === 0) {
      console.log(oldData);
      oldData = oldData.map(v => {
        v.operationWriteType = "2";
        v.isShow = false;
        return v;
      })
    }
    this.setState({ultrasoundMiddleData: oldData},() => console.log(this.state.ultrasoundMiddleData));
  }

  // 处理手术记录输入
  handleOperationEdit = (newData) => {
    let oldData = this.state.operationHistoryData.map(v => JSON.parse(JSON.stringify(v)));
    const oLen = oldData.length;
    const nLen = newData.length;
    for(let i = oLen - 1; i >= 0; i--){
      for(let j = nLen - 1; j >= 0 ; j--){
        // 新建
        if(!newData[j].docUniqueid){
          newData[j].docUniqueid = `-${Math.random()}`;
          newData[j].operationWriteType = "0";
          newData[j].isShow = true;
          oldData.push(newData[j]);
          break;
        }
        // 找到 - 修改
        if(oldData[i].docUniqueid === newData[j].docUniqueid && Number(oldData[i].docUniqueid) > 0){
          newData[j].operationWriteType = "1";
          newData[j].isShow = true;
          oldData[i] = newData[j];
          break;
        }
        // 未找到 - 删除
        if(j === 0 && Number(oldData[i].docUniqueid) > 0){
          oldData[i].operationWriteType = "2";
          oldData[i].isShow = false;
        }
      }
    }
    if(oLen === 0) {
      oldData = newData.map(v => {
        v.operationWriteType = "1";
        v.isShow = true;
        return v;
      })
    }
    if(nLen === 0) {
      oldData = oldData.map(v => {
        v.operationWriteType = "2";
        v.isShow = false;
        return v;
      })
    }
    this.setState({operationHistoryData: oldData},() => console.log(this.state.operationHistoryData));
  }
  /* ========================= 渲染方法 ============================== */
  // 渲染左侧记录树 - 二级
  renderTree = (data) => {
    const { currentExpandedKeys } = this.state;
    return (
      <Tree
        onSelect={this.handleTreeSelect}
        defaultExpandAll
        selectedKeys={this.state.currentTreeKeys || []}
        expandedKeys={currentExpandedKeys}
        multiple={false}
      >
        {data.map(v => (
          <TreeNode title={v.title.slice(0,12)} key={v.key}>
            {v.children.map(u => (
              <TreeNode title={u.key < 0 ? <span style={{color:'red'}}>{u.title}</span> : u.title} key={u.key} />
            ))}
          </TreeNode>
        ))}
      </Tree>
    );
  };
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
          <Collapse defaultActiveKey={['fetus-0', 'fetus-1', 'fetus-2', 'fetus-3', 'fetus-4', 'fetus-5', 'fetus-6', 'fetus-7', 'fetus-8', 'fetus-9', 'fetus-10', 'fetus-11']}>
            <Panel header="主诉" key="fetus-0">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="预产期" key="fetus-1">{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_, { name, value }) => this.handleFormChange("pregnancy_history", name, value))}</Panel>
            <Panel header="现病史" key="fetus-2">{formRender({ medical_history: medical_history }, mdConfig.medical_history_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="唐氏筛查" key="fetus-3">
              <Checkbox checked={!isDownsScreenChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'd')}>未检查</Checkbox>
              {!isDownsScreenChecked ? null : (
                <div>
                  {formRender(downs_screen.hasOwnProperty('early') ? downs_screen['early'] : {}, mdConfig.early_downs_screen_config(), (_, { name, value }) => this.handleFormChange("downs_screen.early", name, value))}
                  {formRender(downs_screen.hasOwnProperty('middle') ? downs_screen['middle'] : {}, mdConfig.middle_downs_screen_config(), (_, { name, value }) => this.handleFormChange("downs_screen.middle", name, value))}
                  {formRender(downs_screen.hasOwnProperty('nipt') ? downs_screen['nipt'] : {}, mdConfig.NIPT_downs_screen_config(), (_, { name, value }) => this.handleFormChange("downs_screen.nipt", name, value))}
                </div>
              )}
            </Panel>
            <Panel header="地贫/血型检查" key="fetus-4">
              <Checkbox checked={!isThalassemiaChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 't')}>未检查</Checkbox>
              {!isThalassemiaChecked ? null : (
                <div>
                  {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_, { name, value }) => this.handleFormChange("thalassemia.wife", name, value))}
                  {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {}, mdConfig.husband_thalassemia(), (_, { name, value }) => this.handleFormChange("thalassemia.husband", name, value))}
                </div>
              )}
            </Panel>
            <Panel header="超声检查" key="fetus-5">
              <Checkbox checked={!isUltrasoundChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 'u')}>未检查</Checkbox>
              {!isUltrasoundChecked ? null : (
                <div>
                  <div>{formRender({ menopause: ultrasound['menopause'] }, mdConfig.ultrasound_menopause_config(), (_, { name, value }) => this.handleFormChange("ultrasound", name, value))}</div>
                  <div>
                    <Tabs
                      activeKey={uFetusActiveKey}
                      onTabClick={this.handleTabsClick}
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
            <Panel header="其他检查" key="fetus-6">{formRender({ other_exam: other_exam }, mdConfig.other_exam_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="既往史" key="fetus-7">
              <div>
                {formRender(past_medical_history, mdConfig.past_medical_history_config(), (_, { name, value }) => this.handleFormChange("past_medical_history", name, value))}
              </div>
              <div>
                {formRender({ operation_history: operationHistoryData }, mdConfig.operation_history_config(), (_, { value }) => this.handleOperationEdit(value))}
              </div>
            </Panel>
            <Panel header="家族史" key="fetus-8">{formRender(family_history, mdConfig.family_history_config(), (_, { name, value }) => this.handleFormChange("family_history", name, value))}</Panel>
            <Panel header="体格检查" key="fetus-9">{formRender(physical_check_up, mdConfig.physical_check_up_config(), (_, { name, value }) => this.handleFormChange("physical_check_up", name, value))}</Panel>
            <Panel header="诊断" key="fetus-10">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="处理" key="fetus-11">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
          </Collapse>
        );
      case '2':
        return (
          <Collapse defaultActiveKey={['genetic-0', 'genetic-1', 'genetic-2', 'genetic-3', 'genetic-4', 'genetic-5', 'genetic-6', 'genetic-7', 'genetic-8', 'genetic-9']}>
            <Panel header="主诉" key="genetic-0">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="预产期" key="genetic-1">{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_, { name, value }) => this.handleFormChange("pregnancy_history", name, value))}</Panel>
            <Panel header="现病史" key="genetic-2">{formRender({ medical_history: medical_history }, mdConfig.medical_history_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="地贫/血型检测" key="genetic-3">
              <Checkbox checked={!isThalassemiaChecked} onChange={(e) => this.handleCheckBox(e.target.checked, 't')}>未检查</Checkbox>
              {!isThalassemiaChecked ? null : (
                <div>
                  {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_, { name, value }) => this.handleFormChange("thalassemia.wife", name, value))}
                  {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {}, mdConfig.husband_thalassemia(), (_, { name, value }) => this.handleFormChange("thalassemia.husband", name, value))}
                </div>
              )}
            </Panel>
            <Panel header="染色体核型" key="genetic-4">{formRender({ karyotype: karyotype }, mdConfig.karyotype_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="其他检查" key="genetic-5">{formRender({ other_exam: other_exam }, mdConfig.other_exam_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="既往史" key="genetic-6">{formRender(past_medical_history, mdConfig.past_medical_history_config(), (_, { name, value }) => this.handleFormChange("past_medical_history", name, value))}</Panel>
            <Panel header="家族史" key="genetic-7">{formRender(family_history, mdConfig.family_history_config(), (_, { name, value }) => this.handleFormChange("family_history", name, value))}</Panel>
            <Panel header="诊断" key="genetic-8">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="处理" key="genetic-9">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
          </Collapse>
        );
      case '3':
        return (
          <Collapse defaultActiveKey={['fuzhen-0', 'fuzhen-1', 'fuzhen-2', 'fuzhen-3', 'fuzhen-4', 'fuzhen-5', 'fuzhen-6']}>
            <Panel header="复诊日期+孕周" key="fuzhen-0">{formRender({ ckweek: ckweek, createdate: createdate || '' }, mdConfig.ckweekAndcreatdate(), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="主诉" key="fuzhen-1">{formRender({ chief_complaint: chief_complaint }, mdConfig.chief_complaint_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="病情变化" key="fuzhen-2">{formRender({ stateChange: stateChange }, mdConfig.stateChange_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="体格检查" key="fuzhen-3">{formRender(physical_check_up, mdConfig.physical_check_up_config(), (_, { name, value }) => this.handleFormChange("physical_check_up", name, value))}</Panel>
            <Panel header="前次检查结果" key="fuzhen-4">{formRender({ lastResult: lastResult }, mdConfig.lastResult_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="诊断" key="fuzhen-5">{formRender({ diagnosis: diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
            <Panel header="处理" key="fuzhen-6">{formRender({ treatment: treatment }, mdConfig.treatment_config(this.openModal), (_, { name, value }) => this.handleFormChange("", name, value))}</Panel>
        </Collapse>
        );
      default:
        return null;
    }
  }

  // 渲染 超声检查 胎儿Tab
  renderUFetusTabPane = (fetusData) => {
    if (fetusData.length === 0) return <div key="none">暂无数据</div>;
    const fetusTabPaneDOM = [];
    fetusData.forEach((fetus, index) => {
      if(!fetus.isHidden) {
        fetusTabPaneDOM.push(
          <TabPane key={fetus.id} tab={`胎儿-${index + 1}`}>
            {/*// TODO 这里的处理需要另外做*/}
            {formRender(fetus, mdConfig.ultrasound_fetus_config(), (_, { name, value }) => this.handleFormChange(`ultrasound.fetus-${index}`, name, value))}
          </TabPane>
        );
      }
    })
    return fetusTabPaneDOM;
  };

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
    if(object.hasOwnProperty('physical_check_up')){
      object['physical_check_up']['edema'] = convertString2Json(object['physical_check_up']['edema']);
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
      const { currentTreeKeys, specialistemrData } = this.state;
      const doctor = specialistemrData[specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0])].doctor || "";
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
  getTemplateInput = ({content}) => {
    const { currentTreeKeys, specialistemrData } = this.state;
    const { type } = this.state.templateObj;
    const index = specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    switch(type) {
      case 'dmr1':
        specialistemrData[index]['chief_complaint'] = content;
        break;
      case 'dmr2':
        specialistemrData[index]['medical_history'] = content;
        break;
      case 'dmr3':
        specialistemrData[index]['other_exam'] = content;
        break;
      case 'dmr4':
        specialistemrData[index]['diagnosis'] = content;
        break;
      case 'dmr5':
        specialistemrData[index]['treatment'] = content;
        break;
      case 'dmr6':
        specialistemrData[index]['karyotype'] = content;
        break;
      case 'dmr7':
        specialistemrData[index]['stateChange'] = content;
        break;
      case 'dmr8':
        specialistemrData[index]['lastResult'] = content;
        break;
      default:
        console.log('type error');
        break;
    }
    this.setState({specialistemrData},() => this.closeModal())
  }


  render() {
    const { specialistemrList, specialistemrData, currentTreeKeys } = this.state;
    const { isShowTemplateModal, doctor, type } = this.state.templateObj;
    // data index用于回调赋值
    const i = specialistemrData.findIndex(item => item.id.toString() === currentTreeKeys[0]);
    let renderData = {};
    if(i !== -1) { renderData = specialistemrData[i]; }
    const { formType } = renderData;
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
          {/* 表单主体 */}
          <div id="form-block">
            {this.renderForm(renderData)}
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
