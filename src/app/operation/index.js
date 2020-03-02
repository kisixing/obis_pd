import React, {Component} from 'react';
import {Button, Collapse, Tabs, Tree, Modal} from "antd";
import Page from '../../render/page';

import service from '../../service/index.js';
import { formateDate, convertString2Json } from './util.js';

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
 * 对A B 数组 特定key值对比
 *  - 情况 A有 B无
 *        A无 B有
 */


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
        {item['children'].map(v => <TreeNode title={v['title']} key={v['key']}/>)}
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
      <TabPane tab={`胎儿${index+1}`} key={v.id}>{formRender(v, formRenderConfig[`config${templateId}`][`operative_procedure_config`](this.openModal), (_,{name, value}) => this.handleFormChange(`operative_procedure.fetus-${index}`,name,value))}</TabPane>
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
      operationList[todayIndex].children.splice(0,0,{title: '待完善病例', key: newId});
      if(currentExpandedKeys.findIndex(key => key === operationList[index].key) === -1) {
        currentExpandedKeys.push(operationList[todayIndex].key); 
      }
     }else {
      operationList.splice(0,0,{title:  todayStr, key: todayStr, children: [{title: "待完善病历", key: newId}]});
      currentExpandedKeys.push(todayStr);
    }
    const currentData = {
      id: newId, key: newId, templateId: 0,createdate: todayStr,
      operationItem: {},
      preoperative_record: {
        operation_date: todayStr
      },
      operative_procedure: {fetus:[{id: ''}]}, 
      surgery: {},
      ward: {}
    };
    operationNewDataList.push(currentData);
    this.setState({operationList,currentExpandedKeys, currentTreeKeys: [newId.toString()], currentShowData: currentData});
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
            this.setState({});
            // 整合请求下来的数据
            let formatData = this.convertOperationDetail(res.object);
            this.setState({clear: true},() => {
              this.setState({currentShowData: formatData, currentTreeKeys: selectedKeys, clear: false},() => console.log(this.state));
            });
            // this.setTemplateIDAndOperationData(formatData);
          }
        });
      }else {
        // 为新建病例，数据存储在本地 - 这里要剪
        const { operationNewDataList } = this.state;
        const targetData = operationNewDataList[operationNewDataList.findIndex(item => item.key.toString() === selectedKeys[0])];
        this.setState({clear: true}, () => {
          this.setState({currentTreeKeys: selectedKeys,currentShowData: targetData, clear: false});
        });

      }
    }
  };

  handleFormChange = (path, name, value) => {
    const { currentShowData, operationNewDataList } = this.state;
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
        preoperative_record: {
          operation_date: currentShowData['preoperative_record']['operation_date']
        },
        operative_procedure: {fetus:[{id: ''}]},
        surgery: {},
        ward: {}
      });
      this.setState({clear: true}, () => {
        this.setState({currentShowData: newCurrentShowData, clear: false});
      })
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
    // 如何时新建病例 ，需要存储本地
    if(currentShowData.id < 0) {
      const index = operationNewDataList.findIndex(item => item.id === currentShowData.id);
      operationNewDataList[index] = currentShowData;
      this.setState({operationNewDataList});
    }
    console.log(name);
    console.log(value);
    this.setState({currentShowData},() => console.log(this.state));
  };
  // TODO
  // 婴儿数量变化 需要特殊处理
  handleTabsEdit = (targetKey, action) => {
    if( action === 'remove') {

    }else if(action === 'add') {

    }
  };

  handleTemplateSelect = (templateId) => {
    const { currentShowData } = this.state;
    currentShowData['templateId'] = templateId;
    this.setState({currentShowData});
  };

  handleSave = () => {
    const { currentShowData } = this.state;
    console.log(currentShowData);
    // 处理
    // try {
    //   currentShowData['preoperative_record']['bleedIndex'] = currentShowData['preoperative_record']['bleedIndex'][0] || {};
    //   currentShowData['preoperative_record']['hemogram'] = currentShowData['preoperative_record']['hemogram'][0] || {};
    //   currentShowData['preoperative_record']['measurement'] = currentShowData['preoperative_record']['measurement'][0] || {};
    //   currentShowData['surgery']['bleedIndex'] = currentShowData['surgery']['bleedIndex'][0] || {};
    //   currentShowData['surgery']['hemogram'] = currentShowData['surgery']['hemogram'][0] || {};
    //   currentShowData['surgery']['measurement'] = currentShowData['surgery']['measurement'][0] | {};
    // }catch (e) {
    //   console.log('非');
    // }
    currentShowData['id'] = currentShowData['id'] || "";

    service.operation.saveOperation(currentShowData).then(res => {
      // console.log(res);
      service.operation.getOperation().then(res => {
        if(res.code === '200' || 200)  this.setState({operationList: res.object.list, currentShowData: {}});
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
    Object.keys(operationItem).forEach(v => operationItem[v] = convertString2Json(operationItem[v]));
    // 术前 血压
    object['preoperative_record']['bp'] = convertString2Json(object['preoperative_record']['bp']) || {};
    //
    operative_procedure['fetus'].forEach(item => Object.keys(item).forEach(key => {
        if(item[key].indexOf('{')!==-1 && item[key].indexOf('}')!==-1)  item[key] = convertString2Json(item[key]);
      })
    );

    // 手动添加对应的key值 - 因为这里是使用treeRecordId请求回来的
    object['key'] = currentTreeKeys[0];
    // 转换时间戳
    object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);
    // 全都做成数组了
    // 包裹数组，表单渲染
    // object['preoperative_record']['bleedIndex'] = [object['preoperative_record']['bleedIndex']] || [];
    // object['preoperative_record']['hemogram'] = [object['preoperative_record']['hemogram']] || [];
    // object['preoperative_record']['measurement'] = [object['preoperative_record']['measurement']] || [];
    // object['surgery']['bleedIndex'] = [object['surgery']['bleedIndex']] || [];
    // object['surgery']['hemogram'] = [object['surgery']['hemogram']] || [];
    // object['surgery']['measurement'] = [object['surgery']['measurement']] || [];
    // 添加templateId 为渲染使用
    object['templateId'] = operationItemTemplateId(object['operationItem']['operationName'].label);
    if(object['templateId'] === -1 && object['ward']['userName'] !== null){
      object['templateId'] = 8;
    }
    return object;
  };

  openModal = (type) => {
    if (type) {
      const { doctor } = this.state.currentShowData;
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
    console.log(content)
    console.log(currentShowData)
    switch(type) {
      case 'or2':
        currentShowData['operative_procedure']['special_case'] = content;
        break;
      case 'or3':
        currentShowData['surgery']['doctors_advice'] = content;
        break;
      case 'or6':
        currentShowData['ward']['operationProcedure'] = content;
        break;
      default:
        console.log('type error');
        break;
    }
    this.setState({currentShowData},() => this.closeModal())
  }


  render() {
    const { operationList, currentShowData = {}, clear } = this.state;
    const { id, templateId = 0 } = currentShowData;
    const { isShowTemplateModal, type, doctor } = this.state.templateObj;
    return (
      <Page className="fuzhen font-16">
        <div className="fuzhen-left ant-col-5">
          <div style={{textAlign: 'center'}}>
            <Button size="small" onClick={this.newOperation}>新增病历</Button>
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
