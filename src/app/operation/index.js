import React, {Component} from 'react';
import {Button, Tree, message} from "antd";
import Page from '../../render/page';

import store from '../store';
import service from '../../service/index.js';
import { formatDate, convertString2Json } from '../../utils/index';


import OperationFrom from './operationForm';

import '../index.less';
import './index.less';

const { TreeNode } = Tree;


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
// const specialEdit = ['preoperativeUltrasonography','preoperativeUltrasonographyLast',];


export default class Operation extends Component{
  constructor(props) {
    super(props);
    this.state = {
      operationList: [], // 树形菜单数据
      operationNewDataList: [], // 用于新建病例

      currentTreeKeys: [], // 树形菜单选择
      currentExpandedKeys: [],
      currentShowData: {}, // 当前展示的数据
    };
  }

  componentDidMount() {
    const { userData } = store.getState();
    if(userData.userid){
      service.operation.getOperation().then(res => {
        if(res.code === '200')  this.setState({operationList: res.object.list});
      })
    }else{
      message.info('用户为空');
    }
  }


  /* ========================= 渲染类 ============================ */
  // 渲染左侧手术记录树
  renderTree = (data) => {
    const { currentExpandedKeys, currentTreeKeys } = this.state;
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
      selectedKeys={currentTreeKeys}
      multiple={false}
    >{tnDOM}</Tree>;
  };

  /* ========================= 事件交互 ============================ */
  // 新建手术记录
  newOperation = () => {
    const { operationList, operationNewDataList, currentExpandedKeys, currentShowData } = this.state;
    const { userData } = store.getState();
    // console.log(userData);
    const todayStr = formatDate();
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
      operationItem: {
        operationName: {},
        operationLevel: {},
        incisionType: {},
        rePuncture: []
      },
      preoperative_record: {
        operation_date: todayStr
      },
      operative_procedure: {fetus:[{id: newId-1}]}, 
      surgery: {},
      ward: {
        userName: userData.username,
        operationDate: todayStr
      }
    };
    operationNewDataList.push(currentData);
    this.setState({operationList,currentExpandedKeys,
        currentTreeKeys: [newId.toString()], 
        currentShowData: currentData,
        currentFetusKey: (newId-1).toString()
      });
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
          // 整合请求下来的数据
          let formatData = this.convertOperationData(res.object);
          let targetFetusKey = ''
          if(formatData['operative_procedure']['fetus'].length !== 0) {
            targetFetusKey = formatData['operative_procedure']['fetus'][0]['id'];
          }
          this.setState({clear: true},() => {
            this.setState({
              currentShowData: formatData,
              currentTreeKeys: selectedKeys,
              clear: false,
              currentFetusKey: targetFetusKey
            });
          });
          // this.setTemplateIDAndOperationData(formatData);
        });
      }else {
        // 为新建病例，数据存储在本地 - 这里要剪
        const { operationNewDataList } = this.state;
        const targetData = operationNewDataList[operationNewDataList.findIndex(item => item.key.toString() === selectedKeys[0])];
        this.setState({clear: true}, () => {
          this.setState({
            currentTreeKeys: selectedKeys,
            currentShowData: targetData,
            clear: false,
            currentFetusKey: targetData['operative_procedure']['fetus'][0]['id'].toString() || ""
          });
        });

      }
    }
  };


  // handleTemplateSelect = (templateId) => {
  //   const { currentShowData } = this.state;
  //   currentShowData['templateId'] = templateId;
  //   if(templateId === 8) {
  //     currentShowData.operationItem.operationName = {value: '病房病历', label: '病房病历'}
  //   }
  //   this.setState({currentShowData});
  // };

  handleSave = (data) => {
    if(data['id'] < 0){
      data['id'] = "";
    }
    console.log(data);
    data['operative_procedure']['fetus'].forEach(v => {
      if(Number(v.id) < 0){
        v.id = "";
      }
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
  };
  /* ========================= 其他 ============================ */
  // 获取数据整合进入state
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
    // 手动添加对应的key值 - 因为这里是使用treeRecordId请求回来的
    // object['key'] = currentTreeKeys[0];
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
  };


  render() {
    const { operationList, currentShowData = {}} = this.state;
    return (
      <Page className="fuzhen font-16">
        <div className="fuzhen-left ant-col-5">
          <div style={{textAlign: 'center'}}>
            <div className="new-button">
              <Button size="default" onClick={this.newOperation}>新增手术记录</Button>
            </div>
          </div>
          <div>
            {this.renderTree(operationList)}
          </div>
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7">
          {/* {id < 0 ? (
            <div className="btn-group">
              <ButtonGroup>
                <Button type={ (templateId<=7&&templateId>=0) ? "primary" : ""} onClick={() => this.handleTemplateSelect(0)}>胎儿中心</Button>
                <Button type={templateId === 8 ? "primary" : ""} onClick={() => this.handleTemplateSelect(8)}>病房</Button>
              </ButtonGroup>
            </div>
          ) : null} */}
          <OperationFrom
            dataSource={currentShowData}
            handleSave={this.handleSave}
          />
          
        </div>
      </Page>
    )
  }
}
