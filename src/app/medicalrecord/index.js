import React, { Component } from 'react';
import store from '../store';
import MedicalRecordForm from './MedicalRecordForm';

import { Tree, Button, message } from 'antd';
import Page from '../../render/page';

import { newDataTemplate } from './data';
import { convertString2Json, formatDate } from '../../utils/index';
import service from "../../service";
import './index.less';
import '../index.less';

const { TreeNode } = Tree;
const ButtonGroup = Button.Group;

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

  /* ========================= 事件交互类 =========================== */
  // 树形结构选择
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
      this.setState({ currentTreeKeys: selectedKeys, currentSpcialistemrData: obj, uFetusActiveKey: '0', cFetusActiveKey: '0' });
    });
    service.ultrasound.getPrenatalPacsMg({ recordid: selectedKeys[0] }).then(res => this.setState({ultrasoundMiddleData: res.object}));
    service.medicalrecord.getOperationHistory().then(res => this.setState({ operationHistoryData: res.object}));
  };

  // 设置新建病历的formType
  handleBtnChange = (key) => {
    const { currentTreeKeys, newSpecialistemrData } = this.state;
    const index = newSpecialistemrData.findIndex(item => item.id === currentTreeKeys[0]);
    let nDatas = newSpecialistemrData.map(v => v);
    nDatas[index]['formType'] = key;
    this.setState({ newSpecialistemrData: nDatas, currentSpcialistemrData: nDatas[index] });
  };

  // 新建病历
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

    console.log(newData);

    newSpecialistemrData.push(newData);
    // 将formType设置为空 用户选择
    this.setState({specialistemrList: newSpecialistemrList,
      currentTreeKeys: [newId],
      newSpecialistemrData,
      currentExpandedKeys,
      currentSpcialistemrData: newData
    });
  };
 
  // 表单保存
  handleSave = (data, ultrasoundMiddleData, operationHistoryData) => {
    const { currentTreeKeys } = this.state;
    const { formType } = data;
    data['physical_check_up']['bp'] = '0'; 
    if(!data.hasOwnProperty('downs_screen')) {data['downs_screen'] = {};}
    if(!data.hasOwnProperty('thalassemia')) {data['thalassemia'] = {};}
    if(!data.hasOwnProperty('physical_check_up')) {data['physical_check_up'] = {};}
    if(formType === '1') {
      data.ultrasound.fetus.forEach(v => {v.id = Number(v.id) < 0 ? "" : v.id;})
    }
    // 新建置空
    data.id = data.id < 0 ? "" : data.id;
    // 专科病历
    service.medicalrecord.savespecialistemrdetail(data).then(res => {
      if(res.code === "200") {
        message.success('成功保存');
        service.medicalrecord.getspecialistemr().then(res => {
          if (res.code === "200" || res.code === 200) {
            this.setState({ specialistemrList: res.object.list, currentTreeKeys: [] , currentSpcialistemrData: {} }, () => { })
          }
        });
      }
    }).catch(err => console.log(err));
    // 超声
    ultrasoundMiddleData.forEach((v) => {
      if(Number(v.docUniqueid) < 0){
        v.docUniqueid = "";
      };
    });
    // 手术
    operationHistoryData.forEach((v) => {
      v.userid = operationHistoryData.userid;
      if(Number(v.docUniqueid) < 0){
        v.docUniqueid = "";
      };
    });
    service.ultrasound.writePrenatalPacsMg({ pacsMgVOList: ultrasoundMiddleData, recordid: currentTreeKeys[0] }).then(res => console.log(res));
    service.medicalrecord.writeOperationHistory({operationHistorys: operationHistoryData }).then(res => console.log(res));
  };

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

  render() {
    const { specialistemrList, currentSpcialistemrData ,currentTreeKeys, ultrasoundMiddleData, operationHistoryData } = this.state;
    const { formType = "" } = currentSpcialistemrData;
    return (
      <Page className='fuzhen font-16 ant-col'>
        <div className="fuzhen-left ant-col-5">
          <div className="new-button"><Button size="default" onClick={this.newSpecialistemr}>新增病历</Button></div>
          <div>{this.renderTree(specialistemrList)}</div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7" id="form-block">
          <div>
            {(Number(currentTreeKeys[0]) < 0) ? this.renderBtn(formType) : null}
          </div>
          <div>
            <MedicalRecordForm 
              dataSource={currentSpcialistemrData}
              ultrasoundMiddleData={ultrasoundMiddleData}
              operationHistoryData={operationHistoryData}
              handleSave={this.handleSave}  
            />
          </div>
        </div>
      </Page>
    )
  }
}
