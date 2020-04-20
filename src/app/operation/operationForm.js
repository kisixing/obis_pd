import React,{Component} from 'react';
import { Collapse, Tabs, Modal, Button, message } from 'antd';

import { formatDate, convertString2Json, getTimeDifference, mapValueToKey } from '../../utils/index';

import TemplateInput from '../../components/templateInput/index';

import formRender,{ fireForm} from "../../render/form";
import formRenderConfig from "./formRenderConfig";

import '../index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;


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



export default class OperationForm extends Component{
  constructor(props){
    super(props);
    this.state = {
      formData: {},
      clear: false,
      currentFetusKey: '0',

      templateObj:{
        isShowTemplateModal: false,
        type: '',
        doctor: ''
      }
    }
  }

  componentDidMount() {
    this.setFormData();
  }

  componentDidUpdate(prevProps = {}) {
    if(JSON.stringify(this.props.dataSource) !== JSON.stringify(prevProps.dataSource)){
      this.setFormData();
    }
  }

  setFormData = () => {
    // 如果为空对象，默认设置为0
    let c = '0';
    try{
      if(this.props.dataSource.operative_procedure.fetus.length !== 0){
        c = this.props.dataSource.operative_procedure.fetus[0].id;
      }
    }catch(e){
      console.error(e);
    }
    // currentFetusKey 类型为string
    this.setState({formData: this.props.dataSource, currentFetusKey: c.toString()});
  }





  /* =================== 表单 ========================= */

  handleFormChange = (path, {name, value, error}) => {
    if(error) {
      message.error(error);
      return;
    }
    const { formData, currentFetusKey } = this.state;
    if(name === 'operationName') {
      // 这里只可能存在 0~7 8种手术模板
      let templateId = operationItemTemplateId(value.value);
      // 清除当前数据
      const newFetusId = -Math.random();
      let newFormData = Object.assign({},{
        id: formData.id,
        key: formData.key,
        createdate: formData.createdate,
        templateId: templateId,
        operationItem: {
          operationName: value
        },
        preoperative_record: {
          operation_date: formData['preoperative_record']['operation_date']
        },
        operative_procedure: {fetus:[{id: newFetusId}]},
        surgery: {},
        ward: {
          operationDate:  formData['preoperative_record']['operation_date']
        }
      });
      this.setState({clear: true}, () => {
        this.setState({formData: newFormData, clear: false, currentFetusKey: newFetusId.toString()});
      })
      // 这个return一定要加
      return ;
    }

    let obj = JSON.parse(JSON.stringify(formData));
    // 通用
    const fIndex = obj['operative_procedure']['fetus'].findIndex(item => item.id.toString() === currentFetusKey);
    let fObj = obj['operative_procedure']['fetus'][fIndex];
    if(path === "") {
      mapValueToKey(obj, value);
    }else {
      switch (name){
        // 时间计算
        case 'start_time':
          if(!fObj.hasOwnProperty('end_time')) {fObj['end_time'] = ""};
          if(fObj['end_time'] !== "") {
            fObj['duration'] = getTimeDifference(value, fObj['end_time']);
            obj['operative_procedure']['fetus'].splice(fIndex,1,fObj);
          }
          break;
        case 'end_time':
          if(!fObj.hasOwnProperty('start_time')) {fObj['start_time'] = ""};
          if(fObj['start_time'] !== "") {
            fObj['duration'] = getTimeDifference(fObj['start_time'],value);
            obj['operative_procedure']['fetus'].splice(fIndex,1,fObj);
          }
          break;
        // 日期要同步
        case 'operationDate':
          obj['preoperative_record']['operation_date'] = value;
          break;
        case 'operation_date':
          obj['ward']['operationDate'] = value;
          break;
        default:
          break;
      }
      mapValueToKey(obj, `${path}.${name}`,value);
    }
    this.setState({formData: obj},() => console.log(this.state.formData));
  };



  renderFetusTabPane = (fetusData, templateId) => {
    if(fetusData.length === 0) return null;
    return fetusData.map((v, index) => (
      <TabPane tab={`胎儿${index+1}`} key={v.id}>
        {formRender(v, formRenderConfig[`config${templateId}`][`operative_procedure_config`](this.openModal), (_, e) => this.handleFormChange(`operative_procedure.fetus-${index}`, e))}
      </TabPane>
    ));
  };
  handleTabsEdit = (targetKey, action) => {
    let { formData } = this.state;
    let newFetusId = -Math.random();
    if( action === 'remove') {
      const i = formData['operative_procedure']['fetus'].findIndex(item => item.id === targetKey);
      formData['operative_procedure']['fetus'].splice(i,1);
    }else if(action === 'add') {
      formData['operative_procedure']['fetus'].push({
        id:newFetusId, operationWriteType: 0
      })
    }
    this.setState({formData, currentFetusKey: newFetusId.toString()});
  };
  handleTabClick = (key) => {this.setState({currentFetusKey: key},() => console.log(this.state))}

  renderFetusTemplateForm = (renderData = {}) => {
    if(Object.keys(renderData).length === 0) return <div>无数据</div>;
    const { templateId = -1} = renderData;
    if(templateId < 0 || templateId > 7) return null;
    return (
      <div>
        <Collapse defaultActiveKey={["operationItem","preoperative_record","operative_procedure","surgery"]}>
          <Panel header="手术项目" key="operationItem">
            {formRender(renderData['operationItem'] || {},formRenderConfig[`config${templateId}`]['operationItem_config'](), (_, e) => this.handleFormChange("operationItem", e))}
          </Panel>
          <Panel header="术前记录" key="preoperative_record">
            {formRender(renderData['preoperative_record'] || {},formRenderConfig[`config${templateId}`]['preoperative_record_config'](), (_, e) => this.handleFormChange("preoperative_record", e))}
          </Panel>
          <Panel header="手术过程" key="operative_procedure">
            <Tabs
              type="editable-card"
              onEdit={this.handleTabsEdit}
              onTabClick={this.handleTabClick}
              activeKey={this.state.currentFetusKey}
            >
              {this.renderFetusTabPane(renderData['operative_procedure']['fetus'],templateId)}
            </Tabs>
          </Panel>
          <Panel header="术后情况" key="surgery">
            {formRender(renderData['surgery'],formRenderConfig[`config${templateId}`]['surgery_config'](this.openModal), (_, e) => this.handleFormChange("surgery", e))}
          </Panel>
        </Collapse>
      </div>
    )
  }

  renderWardForm = (renderData) => {
    const { templateId } = renderData;
    if(templateId !== 8) return null;
    return (
      <div style={{backgroundColor: '#ffffff'}}>
        {formRender(renderData['ward'], formRenderConfig['ward_config'](this.openModal), (_,{value, name, error}) => this.handleFormChange('ward',name,value, error))}
      </div>
    )
  };

  /* ================== 模板 ========================= */
  openModal = (type) => {
    if (type) {
      let { doctor = ""} = this.state.formData;
      if(doctor === null) doctor = "";
      this.setState({templateObj: {isShowTemplateModal: true,type: type,doctor: doctor}});
    }
  }
  closeModal = () => {
    this.setState({
      templateObj: { isShowTemplateModal: false, type: '', doctor: ''}
    })
  }
  getTemplateInput = (items) => {
    const { formData } = this.state;
    const { type } = this.state.templateObj;
    const content = items.map(v => v.content).join(" ");
    let obj = JSON.parse(JSON.stringify(formData));
    // 需要新对象
    switch(type) {
      case 'or2':
        const { currentFetusKey } = this.state;
        const i = obj['operative_procedure']['fetus'].findIndex(item => item.id.toString() === currentFetusKey);
        let fetus = JSON.parse(JSON.stringify(obj['operative_procedure']['fetus'][i]));
        fetus['special_case'] = "";
        fetus['special_case'] = content;
        obj['operative_procedure']['fetus'].splice(i,1,fetus);
        break;
      case 'or3':
        obj['surgery']['doctors_advice'] = content;
        break;
      case 'or6':
        obj['ward']['operationProcedure'] = content;
        break;
      default:
        console.log('type error');
        break;
    }
    this.setState({formData: obj},() => this.closeModal())
  }
  /* =================== save ========================== */
  
  save = () => {
    const { formData } = this.state;
    fireForm(document.getElementById('form-block'), 'valid').then(r => {
      if(r){
        this.props.handleSave(formData);
      }else{
        message.error('请填写所有必填信息');
      }
    })
  }

  render() {
    const { formData, clear } = this.state;
    const { isShowTemplateModal, type, doctor } = this.state.templateObj;
    return (
      <div>
        <div>
          {
            clear ? null : (
              <div id="form-block">
                <div>
                  {this.renderFetusTemplateForm(formData)}
                </div>
                {/* <div>
                  {this.renderWardForm(formData)}
                </div> */}
              </div>
            )
          }
        </div>
        <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn" onClick={this.save}>保存</Button>
          </div>
        <div>
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
        </div>
      </div>
    )
  }
} 