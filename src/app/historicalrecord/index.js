import React,{ Component } from 'react';
import {Button, Checkbox, Collapse, message, Tabs, Tree, Modal} from 'antd';
import Page from '../../render/page';
import store from '../store';

import {convertString2Json, getTimeDifference, mapValueToKey } from '../../utils/index';
import OperationForm from '../operation/operationForm';
import MedicalRecordForm from '../medicalrecord/MedicalRecordForm';

import service from '../../service/index';

import './index.less';
import '../index.less';
import formRender, {fireForm} from "../../render/form";
import TemplateInput from '../../components/templateInput';
import mdConfig from "../medicalrecord/formRenderConfig";
import formRenderConfig from "../operation/formRenderConfig";


const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * 手术项目对应itemTemplateId
 * @param str[string] - 手术项目/operationList 的名称
 * 默认返回值为-1
 * return templateId[number] - 对应的模板编号
 */
const operationItemTemplateId = (str) => {
  if(!str) return -1;
  const ITEM_KEY_WORD = ['羊膜腔穿刺','绒毛活检','脐带穿刺','羊膜腔灌注','选择性减胎','羊水减量','宫内输血','胸腔积液|腹水|囊液穿刺','病房'];
  const splitKey = '|';
  const len = ITEM_KEY_WORD.length;
  let templateId = -1;
  for(let i = 0; i < len ; i++) {
    if(ITEM_KEY_WORD[i].indexOf(splitKey) !== -1){
      const arr = ITEM_KEY_WORD[i].split(splitKey);
      arr.forEach(v => {
        if(str.indexOf(v) !== -1){
          templateId = i;
        }
      })
    }else {
      if(str.indexOf(ITEM_KEY_WORD[i]) !== -1){
        templateId = i;
        break;
      }
    }
  }
  return templateId;
};

export default class HistoricalRecord extends Component{
  constructor(props) {
    super(props);
    this.state = {
      historicalRecordList: {}, // 历史记录树形结构数据
      currentShowData: {},
      currentExpandedKeys: [],
      
      ultrasoundMiddleData: [],
      operationHistoryData: [],
      // control
      currentFetusKey: '-1',
      currentTreeKeys: [], // 当前选中的treeNodeKey
      isOperation: false, // 分辨 专科/手术 病历

    }
  }

  componentDidMount() {
    const { userData } = store.getState();
    if(userData.userid){
      service.historicalrecord.gethistoricalrecords().then(res => {
        if(res.code === "200" || 200) {
          this.setState({historicalRecordList: res.object})
        }
      });
    }else{
      message.info('用户为空');
    }
  }

  /*================================ 事件交互类 ======================================*/
  handleTreeSelect = (selectedKeys, {selected, node}) => {
    if(node.props.children) {
      // 父节点，展开或收起
      const nodeKey = node.props['eventKey'];
      const { currentExpandedKeys } = this.state;
      const i = currentExpandedKeys.findIndex(key => key === nodeKey);
      if(i !== -1) {
        currentExpandedKeys.splice(i,1);
      }else{
        currentExpandedKeys.push(nodeKey);
      }
      this.setState({currentExpandedKeys});
      return ;
    }
    if(!selected) {
      console.log('不允许父节点请求,不允许取消');
      return ;
    }
    if(selectedKeys[0].indexOf('-') !== -1){
      // 手术记录
      service.operation.getOperationdetail({recordid: selectedKeys[0]}).then(res => {
        const targetData = this.convertOperationData(res.object);
        let fetusKey = "";
        if(targetData['operative_procedure']['fetus'].length !== 0) {
          fetusKey = targetData['operative_procedure']['fetus'][0]['id'];
        }
        
        this.setState({clear: true , currentShowData: {}}, () => {
          this.setState({
            currentShowData: targetData, 
            isOperation: true,
            clear: false,
            // 有可能没有fetuskey
            currentFetusKey: fetusKey
          });  
        })
      });
    }else{
      // 专科病历
      service.medicalrecord.getspecialistemrdetail({recordid: selectedKeys[0]}).then(res => {
        this.setState({currentShowData: this.convertSpecailData(res.object), isOperation: false});
      });
      service.ultrasound.getPrenatalPacsMg({recordid: selectedKeys[0]}).then(res => {
        if(res.code === "200"){
          this.setState({ultrasoundMiddleData: res.object})
        }
      });
      service.medicalrecord.getOperationHistory().then(res => {
        if(res.code === "200"){
          this.setState({operationHistoryData: res.object})
        }
      });
    }
  };

  // 公用
  handleSave = (data, ultrasoundMiddleData, operationHistoryData) => {
    console.log(data);
    const { currentTreeKeys, isOperation } = this.state;
    if(isOperation){
      if(data['id'] < 0){data['id'] = "";}
      data['operative_procedure']['fetus'].forEach(v => {
        if(Number(v.id) < 0){v.id = "";}
      })
      // 转换病房中的时间
      if(data.templateId === 8) {
        if(data['ward']['startTime'].toString().length < 6) {
          data['ward']['startTime'] = new Date(data['ward']['operationDate']).Format('yyyy-MM-dd') + " " +currentShowData['ward']['startTime'] + ":00";
        }
        if(data['ward']['endTime'].toString().length < 6) {
          data['ward']['endTime'] =  new Date(data['ward']['operationDate']).Format('yyyy-MM-dd') + " " +currentShowData['ward']['endTime'] + ":00";
        }
        data['ward']['operationDate'] =   new Date(data['ward']['operationDate']).Format('yyyy-MM-dd');
        data['preoperative_record']['operation_date'] =  data['ward']['operationDate'];
      }
      delete data.key;
      delete data['templateId']; 
      service.operation.saveOperation(data).then(res => {
        message.success('保存成功');
        service.operation.getOperation().then(res => {
          this.setState({operationList: res.object.list, currentShowData: {}, currentTreeKeys: []});
        })
      })
    }else{
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
    }
    return;
  }

  /*================================ 渲染类 ======================================*/

  renderTree = (treeData) => {
    const { currentHistoricalRecords = {} , oldHistoricalRecords = {} } = treeData;
    const { currentExpandedKeys } = this.state;
    // TODO 可复用 之后完成功能后再修改
    return (
      <Tree
        selectedKeys={this.state.currentTreeKeys || []}
        onSelect={this.handleTreeSelect}
        expandedKeys={currentExpandedKeys}
      >
        <TreeNode title="本次孕期" key="currentHistoricalRecords">
          {currentHistoricalRecords !== null && currentHistoricalRecords.hasOwnProperty('historicalRecordsDates') ? (
            currentHistoricalRecords['historicalRecordsDates'].map(item => {
              const keyArr = [
                {key: 'medicalRecord', text: '专科病历'},
                {key: 'operationRecords', text: '手术记录'},
                {key: 'rvisit', text: '产检病历'}
              ]
              let tDOM = [];
              keyArr.forEach(({key, text}) => {
                if(item.hasOwnProperty(key)){
                  if(item[key].length !== 0){
                    tDOM.push(
                      <TreeNode title={text} key={`${key}${item.date}`}>
                        {item[key].map(v => (<TreeNode title={v.title} key={v.key}/>))}
                      </TreeNode>
                    )
                  }
                }
              })
              return (
                <TreeNode title={item.date} key={item.date}>
                  {tDOM}
                </TreeNode>  
              )
              // <TreeNode title={item.date} key={item.date}>
              //   {item.hasOwnProperty('medicalRecord') ? (
              //     <TreeNode title="专科病历" key={`medicalRecord${item.date}`}>
              //     {item['medicalRecord'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
              //   </TreeNode>
              //   ) : null}
              //   <TreeNode title="手术记录" key={`operationRecords${item.date}`}>
              //     {item['operationRecords'].map(v => (
              //       <TreeNode title={v.title} key={v.key}/>
              //     ))}
              //   </TreeNode>
              //   <TreeNode title="产检病历" key={`rvisit"${item.date}`}>
              //     {item['rvisit'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
              //   </TreeNode>
              // </TreeNode>
            })
          ) : null}
        </TreeNode>
        <TreeNode title="前次孕期" key="oldHistoricalRecords">
          {currentHistoricalRecords !== null && currentHistoricalRecords.hasOwnProperty('oldHistoricalRecords') ? (
            currentHistoricalRecords['historicalRecordsDates'].map(item => (
              <TreeNode title={item.date} key={item.date}>
                <TreeNode title="专科病历" key="medicalRecord">
                  {item['medicalRecord'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
                </TreeNode>
                <TreeNode title="手术记录" key="operationRecords">
                  {item['operationRecords'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
                </TreeNode>
                <TreeNode title="产检病历" key="rvisit">
                  {item['rvisit'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
                </TreeNode>
              </TreeNode>
            ))
          ) : null}
        </TreeNode>
      </Tree>
    )
  };

  renderForm = () => {
    const { isOperation, currentShowData } = this.state;
    return isOperation ? 
      <OperationForm
        dataSource={currentShowData}
        handleSave={this.handleSave}
      /> : 
      <MedicalRecordForm
        dataSource={currentShowData}
        ultrasoundMiddleData={[]}
        operationHistoryData={[]}
        handleSave={this.handleSave}
      />
  }

  /*================================ 其他 ======================================*/
  
  convertOperationData = (object) => {
    let { operative_procedure, operationItem } = object;
    /* string -> json */
    // 手术记录
    Object.keys(operationItem).forEach(v => object.operationItem[v] = convertString2Json(operationItem[v]));
    // 术前 血压
    object['preoperative_record']['bp'] = convertString2Json(object['preoperative_record']['bp']) || {};
    //
    operative_procedure['fetus'].forEach(item => Object.keys(item).forEach(key => {
        if(item[key].indexOf('{')!==-1 && item[key].indexOf('}')!==-1)  item[key] = convertString2Json(item[key]);
      })
    );
    // 转换库血
    object['preoperative_record']['bloodBank'] = convertString2Json(object['preoperative_record']['bloodBank']);
    // 转换时间戳
    object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);
    object['preoperative_record']['collectBloodDate'] = new Date(object['preoperative_record']['collectBloodDate']);
    object['templateId'] = operationItemTemplateId(object['operationItem']['operationName'].value);
    
    // 暂时这样去判断病房病历
    if(object['templateId'] === 8){
      // 病房病历
      console.log('病房');
      object['templateId'] = 8;
      object['ward']['startTime'] = new Date(object['ward']['startTime']).Format("hh:mm");
      object['ward']['endTime'] = new Date(object['ward']['endTime']).Format("hh:mm");
      object['ward']['operationDate'] = new Date(object['ward']['operationDate']);
      object['ward']['anesthesiaMethod'] = convertString2Json(object['ward']['anesthesiaMethod']);
      object['ward']['operationNameWard'] = convertString2Json(object['ward']['operationNameWard']);
      object['ward']['operationLevelWard'] = convertString2Json(object['ward']['operationLevelWard']);
      object['ward']['incisionTypeWard'] = convertString2Json(object['ward']['incisionTypeWard']);
      object['ward']['operationDate'] = new Date(object['ward']['operationDate']);
    }
    return object;
  }

  convertSpecailData = (object) => {
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
  }

  render() {
    const { historicalRecordList, templateObj } = this.state;
    return (
      <Page className="fuzhen font-16 ant-col ">
        <div className="fuzhen-left ant-col-5">
          {this.renderTree(historicalRecordList)}
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7" id='form-block'>
          {this.renderForm()}
        </div>
      </Page>
    );
  }
}
