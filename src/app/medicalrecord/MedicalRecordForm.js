import React,{ Component, PropTypes  } from 'react';
import { Collapse, Checkbox, Tabs, Modal, Button, message } from 'antd';
import TemplateInput from '../../components/templateInput';

import formRender, { fireForm } from '../../render/form';

import { newDataTemplate } from './data';
import mdConfig from './formRenderConfig';

import { mapValueToKey } from '../../utils/index';

import '../index.less';
import operation from '../../service/operation';

const { Panel } = Collapse;
const { TabPane } = Tabs;

// 可编辑tab的识别符
const ULTRA = 'u', CHECK = 'c';

const defaultActiveKeys = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'];

/**
 * 本页面用于描述 专科病历 右侧的表单区域
 * 所以的逻辑写在这个位置
 * 防止页面过于臃肿 
 */

export default class MedicalRecordForm extends Component{
  constructor(props){
    super(props);
    this.state = {
      formData: {},
      isDChecked: true, // 唐氏
      isTChecked: true, // 地贫
      isUChecked: true, // 超声
      uFetusActiveKey: '0',
      cFetusActiveKey: '0',

      ultrasoundMiddleData: [],
      operationHistoryData: [],

      templateObj: {
        isShowTemplateModal: false,
        doctor: "",
        type: ""
      }
      
    };
  }

  componentDidMount(){
    this.setFormData();
  }

  componentDidUpdate(prevProps) {
    if(JSON.stringify(this.props.dataSource) !== JSON.stringify(prevProps.dataSource)){
      this.setFormData();
    }
  }

  setFormData = () => {
    if(JSON.stringify(this.props.dataSource) === JSON.stringify({})){
      this.setState({
        formData: newDataTemplate,
        templateObj: {doctor: newDataTemplate.doctor,isShowTemplateModal: false,type :""}
      });
    }else{
      this.setState({
        formData: this.props.dataSource,
        templateObj: {doctor: newDataTemplate.doctor,isShowTemplateModal: false,type :""},
        operationHistoryData: this.props.operationHistoryData,
        ultrasoundMiddleData: this.props.ultrasoundMiddleData
      });
    }
  }

  /* ================== 表单处理事件 ===================== */

  // 处理form表单变化 公共处理 -
  // TODO 修改组件后必须改 - 暂时手动传入父键名
  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, {name, value, error}) => {
    console.log(path);
    console.log(name);
    console.log(value);
    if(error) {
      message.error(error);
      return;
    }
    const { formData } = this.state;
    let obj = JSON.parse(JSON.stringify(formData));
    console.log(obj);
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
    this.setState({formData: obj },() => console.log(this.state.formData));
  };

  // 超声 | 体格检查 渲染tabpane 都是用index作为key
  renderFetusTabPane = (fetusData, type) => {
    if(!fetusData || fetusData.length ===0 ) return <div>暂无数据</div>;
    let renderConfigFn, path;
    if(type === ULTRA){
      renderConfigFn = mdConfig.ultrasound_fetus_config;
      path = 'ultrasound.fetus';
    }else if(type === CHECK){
      renderConfigFn =  mdConfig.fetusCheckUp_config;
      path = 'physical_check_up.fetusCheckUp';
    }
    let fetusTabPaneDOM = [];
    let count = 1;
    fetusData.forEach((item, index) => {
      if(!item.isHidden){
        fetusTabPaneDOM.push(
          <TabPane key={index} tab={`胎儿-${count}`}>
            {formRender(item, renderConfigFn(), (_, e) => this.handleFormChange(`${path}-${index}`, e))}
          </TabPane>
        )
        count++;
      }
    }) 
    return fetusTabPaneDOM;
  }
  
  handleTabsClick = (key, type) => {
    if(type === ULTRA){
      this.setState({ uFetusActiveKey: key });
    }else if(type === CHECK){
      this.setState({ cFetusActiveKey: key });
    }
  };

  handleFetusEdit = (targetKey, action, type) => {
    const { formData } = this.state;
    let obj = JSON.parse(JSON.stringify(formData));
    if(action === 'remove') {
      if(type === ULTRA){
        obj.ultrasound.fetus[targetKey].deleteOperation = "1"; 
        obj.ultrasound.fetus[targetKey].isHidden = true; 
      }else if(type === CHECK) {
        obj['physical_check_up']['fetusCheckUp'].splice(targetKey,1);
      }
    }else if(action === 'add'){
      if(type === ULTRA){
        obj.ultrasound.fetus.push({ id: (-Math.random()).toString, userId: formData.userid});
      }else if(type === CHECK){
        if(obj['physical_check_up']['fetusCheckUp'] === null){
          obj['physical_check_up']['fetusCheckUp'] = [];
        }
        obj['physical_check_up']['fetusCheckUp'].push({});
      }
    }
    this.setState({formData: obj});
  }

  handleCheckboxChange = (checked, type) => {
    let obj = JSON.parse(JSON.stringify(this.state.formData));
    if(checked){
      switch(type){
        case 'u':
          obj.ultrasound['fetus'].forEach(v => { 
            if(Number(v.id) > 0){
              v.deleteOperation = "1";
              v.isHidden = true;
            }
          });
          obj.ultrasound['fetus'].push({
            id: `-${Math.random()}`
          })
          obj.ultrasound.menopause = '';
          this.setState({isUChecked: !checked, ultrasoundMiddleData: [], formData: obj, uFetusActiveKey: (obj.ultrasound.fetus.length-1).toString()});
          break;
        case 't':
          obj.thalassemia.wife = {genotype:[]};
          obj.thalassemia.husband = {genotype:[]};
          this.setState({isTChecked: !checked, formData: obj});
          break;
        case 'd':
          obj.downs_screen = {early: {}, middle: {}, nipt: {}};
          this.setState({isDChecked: !checked, formData: obj});
          break;
      }
    }else{
      switch(type){
        case 'u':
          this.setState({isUChecked: !checked});
          break;
        case 't':
          this.setState({isTChecked: !checked});
          break;
        case 'd':
          this.setState({isDChecked: !checked});
          break;
      }
    }
  }

  // handleUltrasoundMiddleEdit
  handleUSEdit = (newData) => {
    this.setState({ultrasoundMiddleData: newData});
  }

  // handleOperationEdit
  handleOEdit = (newData) => {
    this.setState({operationHistoryData: newData},() => console.log(this.state));
  }

  renderForm = (data, ultrasoundMiddleData, operationHistoryData) => {
    if(Object.keys(data).length === 0 ){
      data = newDataTemplate;
    }
    const { formType } = data;
    const { isDChecked, isTChecked, isUChecked } = this.state;
    // 使用病历id
    if(!data.id) return null;
    return (
      <Collapse defaultActiveKey={defaultActiveKeys}>
        <Panel header="主诉" key='1'>{formRender({chief_complaint: data.chief_complaint}, mdConfig.chief_complaint_config(this.openModal), (_, e) => this.handleFormChange("",e))}</Panel>
        {formType === '1' ? (
          [
          <Panel header="超声检查" key='2'>
            <Checkbox checked={!isUChecked} onChange={(e) => this.handleCheckboxChange(e.target.checked, "u")}>未检查</Checkbox>
            {!isUChecked ? null : (
              <div>
                <div>{formRender({ menopause: data.ultrasound['menopause'] }, mdConfig.ultrasound_menopause_config(), (_, e) => this.handleFormChange("ultrasound", e))}</div>
                <div>
                  <Tabs
                    activeKey={this.state.uFetusActiveKey}
                    onTabClick={(key) => this.handleTabsClick(key, ULTRA)}
                    type="editable-card"
                    onEdit={(targetKey, action) => this.handleFetusEdit(targetKey, action, ULTRA)}
                  >{this.renderFetusTabPane(data.ultrasound['fetus'], ULTRA)}</Tabs>
                </div>
                <div>
                  {/* TODO 中孕超声 删除逻辑还没有解决  */}
                  {formRender({ middle: ultrasoundMiddleData }, mdConfig.middle_config(), (_, { value }) => this.handleUSEdit(value))}
                </div>
              </div>
            )}
          </Panel>,
          <Panel header="唐氏筛查" key='3'>
            <Checkbox checked={!isDChecked} onChange={(e) => this.handleCheckboxChange(e.target.checked, "d")}>未检查</Checkbox>
            {!isDChecked ? null : (
              <div>
                {formRender(data.downs_screen['early'], mdConfig.early_downs_screen_config(), (_,  e) => this.handleFormChange("downs_screen.early", e))}
                {formRender(data.downs_screen['middle'], mdConfig.middle_downs_screen_config(), (_,  e) => this.handleFormChange("downs_screen.middle", e))}
                {formRender(data.downs_screen['nipt'], mdConfig.NIPT_downs_screen_config(), (_,  e) => this.handleFormChange("downs_screen.nipt", e))}
              </div>
            )}
          </Panel>
          ]
        ) : null}

        {/* <Panel header="孕产史">暂无</Panel> */}
        
        {formType === '2' ? (
          <Panel header="染色体核型" key='4'>{formRender({ karyotype: data.karyotype }, mdConfig.karyotype_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>
        ) : (
          <Panel header="体格检查" key='16'>
            <div>
              {formRender(data.physical_check_up, mdConfig.physical_check_up_config(), (_, e) => this.handleFormChange("physical_check_up", e))}
            </div>
            <div>
              <div>
                <Tabs
                  activeKey={this.state.cFetusActiveKey}
                  onTabClick={(key) => this.handleTabsClick(key, CHECK)}
                  type="editable-card"
                  onEdit={(targetKey, action) => this.handleFetusEdit(targetKey, action, CHECK)}
                >{this.renderFetusTabPane(data.physical_check_up.fetusCheckUp, CHECK)}</Tabs>
              </div>
            </div>
          </Panel>
        )}
        
        {formType === '3' ? (
          [
            <Panel header="复诊日期+孕周" key='5'>{formRender({ ckweek: data.ckweek, createdate: data.createdate || '' }, mdConfig.ckweekAndcreatdate(), (_, e) => this.handleFormChange("", e))}</Panel>,
            <Panel header="病情变化" key='6'>{formRender({ stateChange: data.stateChange }, mdConfig.stateChange_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>,
            <Panel header="前次检查结果" key="7">{formRender({ lastResult: data.lastResult }, mdConfig.lastResult_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>
          ]
        ) : (
          [
            <Panel header="预产期" key='8'>{formRender(data.pregnancy_history, mdConfig.pregnancy_history_config(), (_, e) => this.handleFormChange("pregnancy_history",e))}</Panel>,
            <Panel header="现病史" key='9'>{formRender({medical_history: data.medical_history}, mdConfig.medical_history_config(this.openModal), (_, e) => this.handleFormChange("",e))}</Panel>,
            <Panel header="地贫/血型检查" key='13'>
              <Checkbox checked={!isTChecked} onChange={(e) => this.handleCheckboxChange(e.target.checked, "t")}>未检查</Checkbox>
              {!isTChecked ? null : (
                <div>
                  {formRender(data.thalassemia['wife'], mdConfig.wife_thalassemia(), (_, e) => this.handleFormChange("thalassemia.wife", e))}
                  {formRender(data.thalassemia['husband'], mdConfig.husband_thalassemia(), (_, e) => this.handleFormChange("thalassemia.husband", e))}
                </div>
              )}
            </Panel>,
            <Panel header="家族史" key='10'>{formRender(data.family_history, mdConfig.family_history_config(), (_, e) => this.handleFormChange("family_history", e))}</Panel>,
            <Panel header="既往史" key='11'>
              <div>
                {formRender(data.past_medical_history, mdConfig.past_medical_history_config(), (_, e) => this.handleFormChange("past_medical_history", e))}
              </div>
              <div>
                {/* TODO 这个位置的处理还没有完成 */}
                {formRender({ operation_history: operationHistoryData }, mdConfig.operation_history_config(), (_, { value }) => this.handleOEdit(value))}
              </div>
            </Panel>,
            <Panel header="其他检查" key='12'>{formRender({other_exam: data.other_exam}, mdConfig.other_exam_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>,
          ]
        )}
        
        <Panel header="诊断" key="14">{formRender({ diagnosis: data.diagnosis }, mdConfig.diagnosis_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>
        <Panel header="处理" key="15">{formRender({ treatment: data.treatment }, mdConfig.treatment_config(this.openModal), (_, e) => this.handleFormChange("", e))}</Panel>
      </Collapse>
    )
  }

  /* ================ templateInput ==================== */
  openModal = (type) => {
    if(type){
      const doctor = this.state.formData.doctor || "";
      this.setState({templateObj: {
        isShowTemplateModal: true,
        type: type,
        doctor: doctor
      }})
    }
  }

  closeModal = () => {
    this.setState({
      templateObj: { isShowTemplateModal: false, type: "", doctor: ""}
    })
  }

  getTemplateInput = (items) => {
    const { type } = this.state.templateObj;
    const content = items.map(v => v.content).join(" ");
    const obj = JSON.parse(JSON.stringify(this.state.formData));
    switch(type) {
      case 'dmr1':
        obj['chief_complaint'] = content;
        break;
      case 'dmr2':
        obj['medical_history'] = content;
        break;
      case 'dmr3':
        obj['other_exam'] = content;
        break;
      case 'dmr4':
        obj['diagnosis'] = content;
        break;
      case 'dmr5':
        obj['treatment'] = content;
        break;
      case 'dmr6':
        obj['karyotype'] = content;
        break;
      case 'dmr7':
        obj['stateChange'] = content;
        break;
      case 'dmr8':
        obj['lastResult'] = content;
        break;
      default:
        console.log('type error');
        break;
    }
    this.setState({
      formData: obj,
      templateObj:{
        isShowTemplateModal: false,
        doctor: obj.doctor,
        type: ""
      } 
    },() => console.log(this.state));
  }

  /* ================ 保存传递给父组件 ==================== */

  save = () => {
    const { formData, ultrasoundMiddleData, operationHistoryData} = this.state;
    fireForm(document.getElementById('form-block'), 'valid').then(r => {
      if(r){
        this.props.handleSave(formData, ultrasoundMiddleData, operationHistoryData);
      }else{
        message.error('请填写所有必填信息');
      }
    })
  }

  render() {
    const { ultrasoundMiddleData, operationHistoryData, formData } = this.state;
    const { isShowTemplateModal, doctor, type } = this.state.templateObj;
    return (
      <div id="form-block">
        <div>
          {this.renderForm(formData, ultrasoundMiddleData, operationHistoryData)}
        </div>
        <div>
          {!this.state.formData.id ? null : ( 
            <div className="btn-group pull-right bottom-btn">
              <Button className="blue-btn">打印</Button>
              <Button className="blue-btn" onClick={this.save}>保存</Button>
            </div>)}
        </div>
        <div>
          <Modal
            visible={isShowTemplateModal}
            onCancel={this.closeModal}
          >
            <TemplateInput
              data={{doctor,type}}
              getData={this.getTemplateInput}
            />
          </Modal>
        </div>
      </div>
    )
  }
}








































/**
 * @param {data}
 * @param {formType}
 */

// MedicalRecordForm.propTypes = {
//   dataSource: PropTypes.shape({
//     formType: PropTypes.string,
//     id: PropTypes.string,
//     userid: PropTypes.string,
//     chief_complaint: PropTypes.string||undefined,
//     medical_history: PropTypes.string||undefined,
//     other_exam: PropTypes.string||null||undefined,
//     diagnosis: PropTypes.string||undefined,
//     pregnancy_history: PropTypes.shape({
//       lmd: string || undefined,

//     })
//   }),
// }