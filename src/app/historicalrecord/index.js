import React,{ Component } from 'react';
import {Button, Checkbox, Collapse, message, Tabs, Tree} from 'antd';
import Page from '../../render/page';

import service from '../../service/index';

import './index.less';
import '../index.less';
import formRender, {fireForm} from "../../render/form";

import mdConfig from "../medicalrecord/formRenderConfig";
import formRenderConfig from "../operation/formRenderConfig";
import {convertString2Json} from "../operation/util";


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
  const ITEM_KEY_WORD = ['羊膜腔穿刺','绒毛活检','脐带穿刺','羊膜腔灌注','选择性减胎','羊水减量','宫内输血','胸腔积液|腹水|囊液穿刺'];
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
  if(objectIndex === -1 && arrayIndex === -1) {
    obj[keyStr] = val;
  }else if(objectIndex < arrayIndex || (objectIndex !== -1 && arrayIndex === -1)){
    const nextKey = keyStr.slice(0,objectIndex);
    if(!obj.hasOwnProperty(nextKey)) {
      obj[nextKey] = {};
    }
    mapValueToKey(obj[nextKey], keyStr.slice(objectIndex+1, len), val);
  }else{
    // 检查到 - ，是数组，try-catch
    const nextKey = keyStr.slice(0,arrayIndex);
    if(Object.prototype.toString.call(obj[nextKey]) !== "[object Array]") {
      obj[nextKey] = [];
    }
    mapValueToKey(obj[nextKey], keyStr.slice(arrayIndex+1, len), val);
  }
};


export default class HistoricalRecord extends Component{
  constructor(props) {
    super(props);
    this.state = {
      historicalRecordList: {}, // 历史记录树形结构数据
      currentShowData: {},
      ultrasoundMiddleData: [],
      // control
      currentTreeKeys: [], // 当前选中的treeNodeKey
      isOperation: false, // 分辨 专科/手术 病历
    }
  }

  componentDidMount() {
    service.historicalrecord.gethistoricalrecords().then(res => {
      if(res.code === "200" || 200) {
        this.setState({historicalRecordList: res.object})
      }
    });
  }

  /*================================ 事件交互类 ======================================*/
  handleTreeSelect = (selectedKeys, {selected, node}) => {
    if(node.props.children || !selected) {
      console.log('不允许父节点请求,不允许取消');
      return ;
    }
    if(selectedKeys[0].indexOf('-') !== -1){
      // 手术记录
      service.operation.getOperationdetail({recordid: selectedKeys[0]}).then(res => {
        console.log(res);
        this.setState({currentShowData: this.convertServiceData(res.object), isOperation: true});
      });
    }else{
      // 专科病历
      service.medicalrecord.getspecialistemrdetail({recordid: selectedKeys[0]}).then(res => {
        console.log(res);
        this.setState({currentShowData: this.convertServiceData(res.object), isOperation: false});
      });
      service.ultrasound.getPrenatalPacsMg({recordid: selectedKeys[0]}).then(res => {
        if(res.code === "200" || 200){
          this.setState({ultrasoundMiddleData: res.object})
        }
      });
      service.medicalrecord.getOperationHistory().then(res => console.log(res));
    }
    // 通过selectedKeys的长度去判别是什么类型手术 | 或者通过node
    // 这个页面应该没有待完善
    // if(Number(selectedKeys[0]) < 0) {
    //   console.log('不允许待完善请求');
    //   this.setState({currentTreeKeys: selectedKeys});
    //   return ;
    // }
    // 请求数据
  };

  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, name, value) => {

    const { currentShowData, isOperation } = this.state;
    if(isOperation) {
      if(name === 'operationName') {
        // 这里只可能存在 0~7 8种手术模板
        let templateId = operationItemTemplateId(value.value);
        // 清除当前数据
        let newCurrentShowData = Object.assign({},{
          id: currentShowData.id,
          key: currentShowData.key,
          createdate: currentShowData.createdate,
          templateId: templateId,
          operationItem: {
            operationName: value
          },
          preoperative_record: {},
          operative_procedure: {fetus:[{id: ''}]},
          surgery: {},
          ward: {}
        });
        this.setState({currentShowData: newCurrentShowData});
        // 这个return一定要加
        return ;
      }
      // 修改超声
      if(name.indexOf('preoperativeUltrasonography') !== -1) {
        // 新增 & 修改 都不用管
        // 删除问题 逻辑
        let oldValue = currentShowData['preoperative_record'][name];
        if(oldValue.length > value.length) {
          // 比较旧值和新值长度
          for(let i = 0; i < oldValue.length; i++) {
            // 将所有得旧值isShow设置为false，写操作置为 2 - 删除
            if(oldValue[i]['docUniqueid'] === "" || oldValue[i]['docUniqueid'] === undefined) {
              oldValue[i]['isShow'] = true;
              oldValue[i]['writeOperationType'] = 0;
            }else {
              oldValue[i]['isShow'] = false;
              oldValue[i]['writeOperationType'] = 2;
            }
            for(let j = 0; j < value.length; j++) {
              if(oldValue[i]['docUniqueid'] ===  value[j]['docUniqueid'] && oldValue[i]['docUniqueid']) {
                oldValue[i]['isShow'] = true;
                oldValue[i]['writeOperationType'] = 1;
                break;
              }
            }
          }
          currentShowData['preoperative_record'][name] = oldValue;
          // 增加
          // console.log(currentShowData['preoperative_record'][name]);
          this.setState({currentShowData},() => console.log(currentShowData));
        }
        return;
      }

      // 通用
      if(path === "") {
        mapValueToKey(currentShowData, value);
      }else {
        mapValueToKey(currentShowData, `${path}.${name}`,value);
      }
      if(currentShowData.templateId === 8) {
        console.log(value);
      }
      this.setState({currentShowData},() => console.log(this.state));
    }else {
      if(path === ""){
        // 为第一层值
        mapValueToKey(currentShowData, name, value);
      }else {
        // 手动 特殊处理bp
        if(name === 'bp'){
          if(value["0"]){name = 'systolic_pressure'; mapValueToKey(currentShowData, `${path}.${name}`, value["0"]);}
          if(value["1"]){name = 'diastolic_pressure';mapValueToKey(currentShowData, `${path}.${name}`, value["1"]);}
          // 特殊处理手术史，中孕超声
        }else if(name === "operation_history"){
          console.log(value);
        } else {
          mapValueToKey(currentShowData, `${path}.${name}`, value);
        }
      }
      this.setState({currentShowData},() => console.log(this.state));
    }

  };

  handleSave = () => {
    const FORM_BLOCK = 'form-block';
    const { isOperation, currentShowData, ultrasoundMiddleData, currentTreeKeys } = this.state;
    if(isOperation) {
      service.operation.saveOperation(currentShowData).then(res => {
        // console.log(res);
        // service.operation.getOperation().then(res => {
        //   if(res.code === '200' || 200)  this.setState({operationList: res.object.list, currentShowData: {}});
        // })
      })
    }else {
      fireForm(document.getElementById(FORM_BLOCK),'valid').then(validCode => {
        if(validCode){
          // 保存
          // 整合bp的格式
          currentShowData['physical_check_up']['bp'] = '0';
          // currentShowData['id'] = "";
          service.medicalrecord.savespecialistemrdetail(currentShowData).then(res => {
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
    }
  }

  /*================================ 渲染类 ======================================*/
  // 渲染树形菜单
  renderTree = (treeData) => {
    const { currentHistoricalRecords = {} , oldHistoricalRecords = {} } = treeData;
    console.log(treeData);
    // TODO 可复用 之后完成功能后再修改
    return (
      <Tree
        selectedKeys={this.state.currentTreeKeys || []}
        onSelect={this.handleTreeSelect}
        defaultExpandAll
      >
        <TreeNode title="本次孕期" key="currentHistoricalRecords">
          {currentHistoricalRecords !== null && currentHistoricalRecords.hasOwnProperty('historicalRecordsDates') ? (
            currentHistoricalRecords['historicalRecordsDates'].map(item => (
              <TreeNode title={item.date} key={item.date}>
                <TreeNode title="专科病历" key="medicalRecord">
                  {item['medicalRecord'].map(v => (
                    <TreeNode title={v.title} key={v.key}>
                      {v.children.map(u => (<TreeNode title={u.title} key={u.key}/>))}
                    </TreeNode>
                  ))}
                </TreeNode>
                <TreeNode title="手术记录" key="operationRecords">
                  {item['operationRecords'].map(v => (
                    <TreeNode title={v.title} key={v.key}>
                      {v.children.map(u => (<TreeNode title={u.title} key={u.key}/>))}
                    </TreeNode>
                  ))}
                </TreeNode>
                <TreeNode title="产检病历" key="rvisit">
                  {item['rvisit'].map(v => (<TreeNode title={v.title} key={v.key}/>))}
                </TreeNode>
              </TreeNode>
            ))
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
  // 渲染专科病历
  renderMedicalRecord = () => {
    const { ultrasoundMiddleData, currentShowData, isDownsScreenChecked, isThalassemiaChecked, isUltrasoundChecked  } = this.state;
    const { formType = "", chief_complaint, pregnancy_history, medical_history, other_exam, diagnosis, treatment, karyotype } = currentShowData;
    const { thalassemia, ultrasound, downs_screen, past_medical_history, family_history, physical_check_up } = currentShowData;
    const { ckweek, createdate ,stateChange, lastResult} = currentShowData;
    console.log(currentShowData);
    switch (formType) {
      case "1":
        return (
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
              <Panel header="其他检查" key="fetus-6">{formRender({other_exam: other_exam},mdConfig.other_exam_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="既往史" key="fetus-7">
                {formRender(past_medical_history, mdConfig.past_medical_history_config(),(_,{name, value}) => this.handleFormChange("past_medical_history",name, value))}
              </Panel>
              <Panel header="家族史" key="fetus-8">
                {formRender(family_history, mdConfig.family_history_config(),(_,{name, value}) => this.handleFormChange("family_history",name, value))}
              </Panel>
              <Panel header="体格检查" key="fetus-9">
                {formRender(physical_check_up, mdConfig.physical_check_up_config(), (_,{name, value}) => this.handleFormChange("physical_check_up",name, value))}
              </Panel>
              <Panel header="诊断" key="fetus-10">{formRender({diagnosis: diagnosis}, mdConfig.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="处理" key="fetus-11">{formRender({treatment: treatment}, mdConfig.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
            </Collapse>
          </div>
        )
        break;
      case "2":
        return (
          <div>
            <Collapse defaultActiveKey={['genetic-0','genetic-1','genetic-2','genetic-3','genetic-4','genetic-5','genetic-6','genetic-7','genetic-8','genetic-9']}>
              <Panel header="主诉" key="genetic-0">{formRender({chief_complaint: chief_complaint},mdConfig.chief_complaint_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="预产期" key="genetic-1">{formRender(pregnancy_history, mdConfig.pregnancy_history_config(), (_,{name, value}) => this.handleFormChange("pregnancy_history",name, value))}</Panel>
              <Panel header="现病史" key="genetic-2">{formRender({medical_history: medical_history},mdConfig.medical_history_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="地贫/血型检测" key="genetic-3">
                {formRender(thalassemia.hasOwnProperty('wife') ? thalassemia['wife'] : {}, mdConfig.wife_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.wife",name, value))}
                {formRender(thalassemia.hasOwnProperty('husband') ? thalassemia['husband'] : {} , mdConfig.husband_thalassemia(), (_,{name, value}) => this.handleFormChange("thalassemia.husband",name, value))}
              </Panel>
              <Panel header="染色体核型" key="genetic-4">{formRender({karyotype: karyotype} , mdConfig.karyotype_config(), (_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="其他检查" key="genetic-5">{formRender({other_exam: other_exam}, mdConfig.other_exam_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="既往史" key="genetic-6">{formRender(past_medical_history, mdConfig.past_medical_history_config(),(_,{name, value}) => this.handleFormChange("past_medical_history",name, value))}</Panel>
              <Panel header="家族史" key="genetic-7">{formRender(family_history,mdConfig.family_history_config(),(_,{name, value}) => this.handleFormChange("family_history",name, value))}</Panel>
              <Panel header="诊断" key="genetic-8">{formRender({diagnosis: diagnosis},mdConfig.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="处理" key="genetic-9">{formRender({treatment: treatment},mdConfig.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
            </Collapse>
          </div>
        );
        break;
      case "3":
        return (
          <div>
            <Collapse defaultActiveKey={['fuzhen-0','fuzhen-1','fuzhen-2','fuzhen-3','fuzhen-4','fuzhen-5','fuzhen-6']}>
              {/* 这个位置的数据可能和上边的不一样 */}
              <Panel header="复诊日期+孕周" key="fuzhen-0">{formRender({ckweek: ckweek || '',createdate: createdate || '' }, mdConfig.ckweekAndcreatdate(), (_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="主诉" key="fuzhen-1">{formRender({chief_complaint: chief_complaint},mdConfig.chief_complaint_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="病情变化" key="fuzhen-2">{formRender({stateChange: stateChange},mdConfig.stateChange_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="体格检查" key="fuzhen-3">{formRender(physical_check_up, mdConfig.physical_check_up_config(),(_,{name, value}) => this.handleFormChange("physical_check_up",name, value))}</Panel>
              <Panel header="前次检查结果" key="fuzhen-4">{formRender({lastResult: lastResult},mdConfig.lastResult_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="诊断" key="fuzhen-5">{formRender({diagnosis: diagnosis}, mdConfig.diagnosis_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
              <Panel header="处理" key="fuzhen-6">{formRender({treatment: treatment}, mdConfig.treatment_config(),(_,{name, value}) => this.handleFormChange("",name, value))}</Panel>
            </Collapse>
          </div>
        )
        break;
      default:
        return null;
    }
  };
  // 渲染手术病历
  // 渲染 胎儿中心类模板 - templateId 0~7
  renderFetusTemplateForm = () => {
    const renderData = this.state.currentShowData;
    if(Object.keys(renderData).length === 0) return <div>无数据展示</div> ;
    const { templateId = -1 } = renderData;
    if(templateId < 0 || templateId > 7) return null;
    return (
      <div id="form-block">
        <Collapse defaultActiveKey={["operationItem","preoperative_record","operative_procedure","surgery"]}>
          <Panel header="手术项目" key="operationItem">
            {formRender(renderData['operationItem'] || {},formRenderConfig[`config${templateId}`]['operationItem_config'](), (event,{name, value}) => this.handleFormChange("operationItem",name,value,event))}
          </Panel>
          <Panel header="术前记录" key="preoperative_record">
            {formRender(renderData['preoperative_record'] || {},formRenderConfig[`config${templateId}`]['preoperative_record_config'](), (_,{name, value}) => this.handleFormChange("preoperative_record",name,value))}
          </Panel>
          <Panel header="手术过程" key="operative_procedure">
            <Tabs
              type="editable-card"
              onEdit={this.handleTabsEdit}
            >
              {this.renderFetusTabPane(renderData['operative_procedure']['fetus'],templateId)}
            </Tabs>
          </Panel>
          <Panel header="术后情况" key="surgery">
            {formRender(renderData['surgery'],formRenderConfig[`config${templateId}`]['surgery_config'](), (_,{name, value}) => this.handleFormChange("surgery",name,value))}
          </Panel>
        </Collapse>
      </div>
    )
  };
  // 渲染病房病历
  renderWardForm = () => {
    const renderData = this.state.currentShowData;
    const { templateId = -1 } = renderData;
    if(templateId !== 8) return null;
    return (
      <div>
        {formRender(renderData['ward'], formRenderConfig['ward_config'](), (_,{value, name}) => this.handleFormChange('ward',name,value))}
      </div>
    )
  };
  // 渲染 手术操作 胎儿Tab
  renderFetusTabPane = (fetusData, templateId) => {
    if(fetusData.length === 0) return null;
    return fetusData.map((v, index) => (
      <TabPane tab={`胎儿${index+1}`} key={v.id}>{formRender(v, formRenderConfig[`config${templateId}`][`operative_procedure_config`](), (_,{name, value}) => this.handleFormChange(`operative_procedure.fetus-${index}`,name,value))}</TabPane>
    ));
  };


  /*================================ 其他 ======================================*/
  // 数据整合
  convertServiceData = (object) => {
    const { currentTreeKeys } = this.state;
    if(object.hasOwnProperty('formType')){
      // 专科病历
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
      console.log('专科病历');
    }else if(object.hasOwnProperty('operationItem')){
      const { operative_procedure, operationItem } = object;
      Object.keys(operationItem).forEach(v => operationItem[v] = convertString2Json(operationItem[v]));
      object['preoperative_record']['bp'] = convertString2Json(object['preoperative_record']['bp']) || {};
      operative_procedure['fetus'].forEach(item => Object.keys(item).forEach(key => {
          if(item[key].indexOf('{')!==-1 && item[key].indexOf('}')!==-1)  item[key] = convertString2Json(item[key]);
        })
      );
      object['key'] = currentTreeKeys[0];
      object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);
      object['templateId'] = operationItemTemplateId(object['operationItem']['operationName'].label);
      if(object['templateId'] === -1 && object['ward']['userName'] !== null){
        object['templateId'] = 8;
      }
      console.log('手术病历');
    }
    return object;
  };

  render() {
    const { historicalRecordList } = this.state;
    return (
      <Page className="fuzhen font-16 ant-col ">
        <div className="fuzhen-left ant-col-5">
          {this.renderTree(historicalRecordList)}
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7" id='form-block'>
          <div>
            {this.renderMedicalRecord()}
          </div>
          <div>
            {this.renderFetusTemplateForm()}
          </div>
          <div>
            {this.renderWardForm()}
          </div>
          <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
          </div>
        </div>
      </Page>
    );
  }
}
