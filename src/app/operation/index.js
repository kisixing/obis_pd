import React, {Component} from 'react';
import {Button, Collapse, Tabs, Tree, Modal} from "antd";
import Page from '../../render/page';

import service from '../../service/index.js';
import { formateDate, convertString2Json, getTimeDifference } from '../../utils/index';

import TemplateInput from '../../components/templateInput/index';

import '../index.less';
import './index.less';
import formRender from "../../render/form";
import formRenderConfig from "./formRenderConfig";
const { TreeNode } = Tree;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const ButtonGroup = Button.Group;

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

/**
 * 手术项目对应itemTemplateId
 * @param str[string] - 手术项目/operationList 的名称
 * 默认返回值为-1
 * return templateId[number] - 对应的模板编号
 */
const operationItemTemplateId = (str) => {
  console.log(str);
  if(str === null || str === undefined) return -1;
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

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


// 'bleedIndex','hemogram','measurement'
const specialEdit = ['preoperativeUltrasonography','preoperativeUltrasonographyLast',];


export default class Operation extends Component{
  constructor(props) {
    super(props);
    this.state = {
      operationList: [], // 树形菜单数据
      operationNewDataList: [], // 用于新建病例

      currentTreeKeys: [], // 树形菜单选择
      currentExpandedKeys: [],
      currentShowData: {}, // 当前展示的数据

      clear: false, // 用于清空表单的渲染，不然会造成前一表单遗留
      
      currentFetusKey: '-1',

      // 模板功能
      templateObj: {
        isShowTemplateModal: false,
        type: '',
        doctor: ''
      },
    };
  }

  componentDidMount() {
    service.operation.getOperation().then(res => {
      if(res.code === '200' || 200)  this.setState({operationList: res.object.list});
    })
  }


  /* ========================= 渲染类 ============================ */
  // 渲染左侧手术记录树
  renderTree = (data) => {
    const { currentExpandedKeys } = this.state;
    let tnDOM = [];
    if(data.length === 0) return <div>无手术记录</div>;
    // key-用于请求
    data.forEach(item => tnDOM.push(
      <TreeNode title={item['title'].slice(0,10)} key={item['key']}>
        {item['children'].map(v => 
          (<TreeNode title={<span style={{color: v.id > 0 ? '' : 'red'}}>{v['title']}</span>} key={v['key']}/>)
        )}
      </TreeNode>)
    );
    return <Tree
      onSelect={this.handleTreeSelect}
      defaultExpandAll
      expandedKeys={currentExpandedKeys}
      selectedKeys={this.state.currentTreeKeys || []}
      multiple={false}
    >{tnDOM}</Tree>;
  };
  // 渲染 胎儿中心类模板 - templateId 0~7
  renderFetusTemplateForm = (renderData) => {
    const { currentFetusKey } = this.state;
    console.log(renderData);
    if(Object.keys(renderData).length === 0) return <div>无数据展示</div> ;
    const { templateId } = renderData;
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
              onTabClick={this.handleTabClick}
              activeKey={currentFetusKey}
            >
              {this.renderFetusTabPane(renderData['operative_procedure']['fetus'],templateId)}
            </Tabs>
          </Panel>
          <Panel header="术后情况" key="surgery">
            {formRender(renderData['surgery'],formRenderConfig[`config${templateId}`]['surgery_config'](this.openModal), (_,{name, value}) => this.handleFormChange("surgery",name,value))}
          </Panel>
        </Collapse>
      </div>
    )
  };
  // 渲染病房病历
  renderWardForm = (renderData) => {
    const { templateId } = renderData;
    if(templateId !== 8) return null;
    return (
      <div>
        {formRender(renderData['ward'], formRenderConfig['ward_config'](this.openModal), (_,{value, name}) => this.handleFormChange('ward',name,value))}
      </div>
    )
  };
  // 渲染 手术操作 胎儿Tab
  renderFetusTabPane = (fetusData, templateId) => {
    if(fetusData.length === 0) return null;
    return fetusData.map((v, index) => (
      <TabPane tab={`胎儿${index+1}`} key={v.id}>
        {formRender(v, formRenderConfig[`config${templateId}`][`operative_procedure_config`](this.openModal), (_,{name, value}) => this.handleFormChange(`operative_procedure.fetus-${index}`,name,value))}
      </TabPane>
    ));
  };

  /* ========================= 事件交互 ============================ */
  //
  newOperation = () => {
    const { operationList, operationNewDataList, currentExpandedKeys, currentShowData } = this.state;
    const todayStr = formateDate();
    // 新建元素的id
    const newId = 0 - Math.random()*100|0;
    const todayIndex = operationList.findIndex(item => item.title === todayStr);
    if(todayIndex !== -1){
      operationList[todayIndex].children.splice(0,0,{title: '待完善手术记录', key: newId});
      if(currentExpandedKeys.findIndex(key => key === operationList[todayIndex].key) === -1) {
        currentExpandedKeys.push(operationList[todayIndex].key); 
      }
     }else {
      operationList.splice(0,0,{title:  todayStr, key: todayStr, children: [{title: "待完善手术记录", key: newId}]});
      currentExpandedKeys.push(todayStr);
    }
    const currentData = {
      id: newId, key: newId, templateId: 0,createdate: todayStr,
      operationItem: {},
      preoperative_record: {
        operation_date: todayStr
      },
      operative_procedure: {fetus:[{id: newId-1}]}, 
      surgery: {},
      ward: {
        operationDate: todayStr
      }
    };
    operationNewDataList.push(currentData);
    this.setState({operationList,currentExpandedKeys,
        currentTreeKeys: [newId.toString()], 
        currentShowData: currentData,
        currentFetusKey: (newId-1).toString()
      },() => console.log(this.state));
  };
  //
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
      console.warn('不允许父节点请求,不允许取消');
      return ;
    }
    if(selectedKeys.length !== 0) {
      if(selectedKeys[0].length > 3) {
        // 非新建病例
        service.operation.getOperationdetail({recordid: selectedKeys[0]}).then(res => {
          if(res.code === 200 || res.code === "200"){
            // 整合请求下来的数据
            let formatData = this.convertOperationDetail(res.object);
            let targetFetusKey = ''
            if(formatData['operative_procedure']['fetus'].length !== 0) {
              targetFetusKey = formatData['operative_procedure']['fetus'][0]['id'];
            }
            console.log(formatData);
            this.setState({clear: true},() => {
              this.setState({
                currentShowData: formatData,
                currentTreeKeys: selectedKeys,
                clear: false,
                currentFetusKey: targetFetusKey
              },() => console.log(this.state));
            });
            // this.setTemplateIDAndOperationData(formatData);
          }
        });
      }else {
        // 为新建病例，数据存储在本地 - 这里要剪
        const { operationNewDataList } = this.state;
        const targetData = operationNewDataList[operationNewDataList.findIndex(item => item.key.toString() === selectedKeys[0])];
        // let targetFetusKey = ''
        //     if(formatData['operative_procedure']['fetus'].length !== 0) {
        //       targetFetusKey = formatData['operative_procedure']['fetus'][0]['id'];
        // }
        this.setState({clear: true}, () => {
          this.setState({
            currentTreeKeys: selectedKeys,
            currentShowData: targetData,
            clear: false,
            currentFetusKey: targetData['operative_procedure']['fetus'][0]['id'].toString() || ""
          },() => console.log(this.state));
        });

      }
    }
  };

  handleFormChange = (path, name, value) => {
    const { currentShowData, operationNewDataList, currentFetusKey } = this.state;
    if(name === 'operationName') {
      // 这里只可能存在 0~7 8种手术模板
      let templateId = operationItemTemplateId(value.value);
      // 清除当前数据
      const newFetusId = -Math.random();
      let newCurrentShowData = Object.assign({},{
        id: currentShowData.id,
        key: currentShowData.key,
        createdate: currentShowData.createdate,
        templateId: templateId,
        operationItem: {
          operationName: value
        },
        preoperative_record: {
          operation_date: currentShowData['preoperative_record']['operation_date']
        },
        operative_procedure: {fetus:[{id: newFetusId}]},
        surgery: {},
        ward: {
          operationDate:  currentShowData['preoperative_record']['operation_date']
        }
      });
      this.setState({clear: true}, () => {
        this.setState({currentShowData: newCurrentShowData, clear: false, currentFetusKey: newFetusId.toString()});
      })
      // 这个return一定要加
      return ;
    }
    let obj = JSON.parse(JSON.stringify(currentShowData));
    // 修改超声|其他table类 - 这里使用operationWriteType方式
    if(specialEdit.findIndex(i => i === name) !== -1) {
    // if(name.indexOf('preoperativeUltrasonography') !== -1) {
      // 删除问题 逻辑
      let oldValue = obj['preoperative_record'][name] || [];
      console.log(oldValue, value);
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
        obj['preoperative_record'][name] = oldValue;
        // 增加
        // console.log(currentShowData['preoperative_record'][name]);
        
      }else {
        // 新增 & 修改 都不用管
        mapValueToKey(obj, `${path}.${name}`,value);
      }
      this.setState({currentShowData: obj},() => console.log(this.state.currentShowData));
      return;
    }
    // 通用
    
    // 当前胎儿的index
    console.log(obj);
    console.log(currentFetusKey);
    const fIndex = obj['operative_procedure']['fetus'].findIndex(item => item.id.toString() === currentFetusKey);
    let fObj = obj['operative_procedure']['fetus'][fIndex];
    console.log(name);
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
    if(obj.templateId === 8) {
      console.log(value);
    }
    // 如何时新建病例 ，需要存储本地
    if(obj.id < 0) {
      const index = operationNewDataList.findIndex(item => item.id === obj.id);
      operationNewDataList[index] = obj;
      this.setState({operationNewDataList});
    }
    this.setState({currentShowData: obj},() => console.log(this.state));
  };
  // TODO
  // 婴儿数量变化 需要特殊处理
  handleTabsEdit = (targetKey, action) => {
    let { currentShowData } = this.state;
    let newFetusId = -Math.random();
    if( action === 'remove') {
      const i = currentShowData['operative_procedure']['fetus'].findIndex(item => item.id === targetKey);
      currentShowData['operative_procedure']['fetus'].splice(i,1);
    }else if(action === 'add') {
      currentShowData['operative_procedure']['fetus'].push({
        id:newFetusId, operationWriteType: 0
      })
    }
    this.setState({currentShowData, currentFetusKey: newFetusId.toString()});
  };
  // 处理
  handleTabClick = (key) => {
    this.setState({currentFetusKey: key});
  }


  handleTemplateSelect = (templateId) => {
    const { currentShowData } = this.state;
    currentShowData['templateId'] = templateId;
    if(templateId === 8) {
      currentShowData.operationItem.operationName = {value: '病房病历', label: '病房病历'}
    }
    this.setState({currentShowData});
  };

  handleSave = () => {
    const { currentShowData } = this.state;
    if(currentShowData['id'] < 0){
      currentShowData['id'] = "";
    }
    currentShowData['operative_procedure']['fetus'].forEach(v => {
      if(Number(v.id) < 0){
        v.id = "";
      }
    })
    // 转换病房中的时间
    if(currentShowData.templateId === 8) {
      if(currentShowData['ward']['startTime'].toString().length < 6) {
        currentShowData['ward']['startTime'] = new Date(currentShowData['ward']['operationDate']).Format('yyyy-MM-dd') + " " +currentShowData['ward']['startTime'] + ":00";
      }
      if(currentShowData['ward']['endTime'].toString().length < 6) {
        currentShowData['ward']['endTime'] =  new Date(currentShowData['ward']['operationDate']).Format('yyyy-MM-dd') + " " +currentShowData['ward']['endTime'] + ":00";
      }
      currentShowData['ward']['operationDate'] =   new Date(currentShowData['ward']['operationDate']).Format('yyyy-MM-dd');
      currentShowData['preoperative_record']['operation_date'] =  currentShowData['ward']['operationDate'];
    }
    delete currentShowData.key;
    delete currentShowData['templateId']; 
    console.log(currentShowData);
    service.operation.saveOperation(currentShowData).then(res => {
      // console.log(res);
      service.operation.getOperation().then(res => {
        if(res.code === '200' || 200)  this.setState({operationList: res.object.list, currentShowData: {}, currentTreeKeys: []});
      })
    })
  };
  /* ========================= 其他 ============================ */
  // 获取数据整合进入state
  convertOperationDetail = (object) => {
    let { currentTreeKeys } = this.state;
    let { operative_procedure, operationItem } = object;
    /* string -> json */
    // 手术记录
    console.log(object);
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
    // 手动添加对应的key值 - 因为这里是使用treeRecordId请求回来的
    object['key'] = currentTreeKeys[0];
    // 转换时间戳
    console.log(object);
    object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);
    object['preoperative_record']['collectBloodDate'] = new Date(object['preoperative_record']['collectBloodDate']);
    if(object['operationItem']['operationName'].hasOwnProperty('value')) {
      object['templateId'] = operationItemTemplateId(object['operationItem']['operationName'].value);
    }else {
      object['templateId'] = -1;
    }
    
    // 暂时这样去判断病房病历
    if(object['templateId'] === -1){
      // 病房病历
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
  };

  openModal = (type) => {
    if (type) {
      let { doctor = ""} = this.state.currentShowData;
      if(doctor === null) doctor = "";
      this.setState({templateObj: {isShowTemplateModal: true,type: type,doctor: doctor}});
    }
  }

  closeModal = () => {
    this.setState({
      templateObj: { isShowTemplateModal: false, type: '', doctor: ''}
    })
  }

  getTemplateInput = ({content}) => {
    const { currentShowData } = this.state;
    const { type } = this.state.templateObj;
    let obj = JSON.parse(JSON.stringify(currentShowData));
    // 需要新对象
    switch(type) {
      case 'or2':
        const { currentFetusKey } = this.state;
        const i = obj['operative_procedure']['fetus'].findIndex(item => item.id === currentFetusKey);
        console.log(obj['operative_procedure']['fetus']);
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
    this.setState({currentShowData: obj},() => this.closeModal())
  }


  render() {
    const { operationList, currentShowData = {}, clear } = this.state;
    const { id, templateId = 0 } = currentShowData;
    const { isShowTemplateModal, type, doctor = "" } = this.state.templateObj;
    console.log(this.state);
    return (
      <Page className="fuzhen font-16">
        <div className="fuzhen-left ant-col-5">
          <div style={{textAlign: 'center'}}>
            <Button size="small" onClick={this.newOperation}>新增手术记录</Button>
          </div>
          <div>
            {this.renderTree(operationList)}
          </div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7">
          {id < 0 ? (
            <div className="btn-group">
              <ButtonGroup>
                <Button type={ (templateId<=7&&templateId>=0) ? "primary" : ""} onClick={() => this.handleTemplateSelect(0)}>胎儿中心</Button>
                <Button type={templateId === 8 ? "primary" : ""} onClick={() => this.handleTemplateSelect(8)}>病房</Button>
              </ButtonGroup>
            </div>
          ) : null}
          {clear ? null : (
            <div>
              <div>
                {this.renderFetusTemplateForm(currentShowData)}
              </div>
              <div>
                {this.renderWardForm(currentShowData)}
              </div>
            </div>
          )}
          <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
          </div>
        </div>
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
