import React, {Component} from 'react';

import {Button, Collapse, Input, Modal, Tabs, Tree} from 'antd';
import Page from '../../render/page';

import formRender,{fireForm} from '../../render/form.js';
import service from '../../service';
// Css
import './index.less';
import '../index.less';
// 引入config
import formRenderConfig from './formRenderConfig.js';
/**
 * TODO
 * 2020-02-07
 *  1 是否用药 特殊输入框 暂时不可用实现
 *  2 送检项目 的 treeselect 有小横线 BUG
 *  3 新建的Tab 因为类型问题，会console.error
 *  4 打开otherInput的modal，原来的ant-select遮挡
 *  5 新建病例功能 未做
 */

const { TreeNode } = Tree;
const ButtonGroup = Button.Group;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// TODO 和专科页面是一样的，等整个项目完成再整合起来
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
  console.log(keyStr);
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
    // 这个位置可能会BUG
    if(Object.prototype.toString.call(obj[nextKey]) !== "[object Array]") {
      obj[nextKey] = [];
    }
    mapValueToKey(obj[nextKey], keyStr.slice(arrayIndex+1, len), val);
  }
}

/**
 * 手术项目对应itemTemplateId
 * @param str[string] - 手术项目/operationList 的名称
 *
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
}
// 将后台返回的string转为object
const convertString2Json = function(str) {
  const splitKey = "},{";
  let index = str.indexOf(splitKey);
  if(index === -1) {
    try{
      return JSON.parse(str);
    }catch (e){
      console.log('此字符串非json格式数据');
    }
  }
  let len = str.length, resArr = [];
  // 去掉前后的括号
  str = str.substring(1,len-1);
  index = str.indexOf(splitKey);
  while(index !== -1) {
    try{
      resArr.push(JSON.parse(str.substring(0,index+1)));
    }catch (e) {
      console.log('此字符串非json格式数据');
    }
    str = str.substring(index+2, len);
    len = str.length;
    index = str.indexOf(splitKey);
  }
  resArr.push(JSON.parse(str));
  return resArr;
};


export default class Operation extends Component{
  constructor(props) {
    super(props);
    this.state = {
      // 左侧树形菜单
      operationList: [],
      operationData: [],


      // 控制
      currentTreeKeys: [],
      templateId: 0,     // 模板id,
      index: -1,
      currentFetusActiveKey: "",  // 当前activeTab
      isShowOtherContextModal: false,
      isFetusPage: true,
      otherContext: "",
    };
  }

  componentDidMount() {
    // 获取手术记录的json
    service.operation.getOperation().then(res => {
      // 将数据setState 进入 state 中
      if(res.code === '200' || 200) {

        this.setState({operationList: res.object.list}, () => {
          // 获取list后，默认获取第一个手术项目detail
          const { operationList } = this.state;
          // service.operation.getOperationdetail({recordid: operationList[0].children[0]['key']})
          //   .then(res => {
          //     console.log(JSON.parse(res.object));
          //     if(res.code === 200 || "200") this.convertOperationDetail(res.object)
          //   });
        });
      }
    })
  }



  /* ========================= 渲染方法 ============================ */
  // 渲染左侧手术记录树
  renderTree = (data) => {
    let tnDOM = [];
    if(data.length === 0) {
      return <div>无手术记录</div>;
    }
    data.forEach(item => {
      tnDOM.push(
        <TreeNode title={item['title'].slice(0,10)} key={item['key']} id={item['id']}>
          {item['children'].map(v => (
            <TreeNode title={v['title']} key={v['key']}/>
          ))}
        </TreeNode>
      )
    });
    return <Tree
      onSelect={this.handleTreeSelect}
      defaultExpandAll
      selectedKeys={this.state.currentTreeKeys || []}
      multiple={false}
    >{tnDOM}</Tree>;
  };
  // 渲染 手术操作 胎儿Tab
  renderFetusTabPane = (fetusData, templateId) => {
    if(fetusData.length === 0) return null;
    return fetusData.map((v, index) => (
      <TabPane tab={`胎儿${index + 1}`} key={v.id}>
        {formRender(v, formRenderConfig[`config${templateId}`][`operative_procedure_config`](), (_,{name, value}) => this.handleFormChange(`operative_procedure.fetus-${index}`,name,value))}
      </TabPane>
    ));
  };

  /* ========================= 事件交互 ============================ */
  // 选择树形菜单获取病例
  handleTreeSelect = (selectedKeys, {selected, node}) => {
    if(node.props.children || !selected) {
      console.log('不允许父节点请求,不允许取消');
      return ;
    }
    if(Number(selectedKeys[0]) < 0) {
      console.log('不允许待完善请求');
      this.setState({currentTreeKeys: selectedKeys});
      return ;
    }
    if(selectedKeys.length !== 0) {
      service.operation.getOperationdetail({recordid: selectedKeys[0]}).then(res => {
          if(res.code === 200 || "200"){
            this.setState({currentTreeKeys: selectedKeys},);
            this.convertOperationDetail(res.object)
          }
        });
    }
  };
  // 新建病历
  newOperation = () => {
      const ONE_DAY_MS = 86400000;
      const { operationList, operationData } = this.state;
      // 判断第一个是否是今天
      const nD = new Date();
      if(operationList.length === 0 || nD.getTime() - Date.parse(operationList[0]['title']) > ONE_DAY_MS) {
        // 以往的记录不是今天 || 病例为空
        let m = nD.getMonth() + 1, d = nD.getDate();
        operationList.splice(0,0,{title: `${nD.getFullYear()}-${m < 10 ? `0${m}`: m}-${d < 1?`0${d}`:d}` , key: "n-1", children: [{title: "待完善病历", key: "-1"}]})
      }else {
        operationList[0]['children'].splice(0,0,{title: '待完善病历', key: "-1"})
      }
      const newId = `-${Math.random()*100|0}`;
      console.log(newId);
      operationData.push({
        id: newId,key: newId,
        operationItem: {}, preoperative_record: {}, operative_procedure: {fetus:[{id: '-1'}]}, surgery: {},
        ward: {}
      });
      this.setState({operationList, currentTreeKeys: [newId],operationData,index: operationData.length-1},() => console.log(this.state));

  };
  // 处理表单变化
  /**
   *
   * @param path        多层结构路径 不包含最后一个键值 a.b-c
   * @param name        键名路径
   * @param value       值
   */
  handleFormChange = (path, name, value) => {
    console.log(value);
    const { operationData, index, templateId } = this.state;
    if(name === 'operationName') {
      this.setState({templateId: operationItemTemplateId(value)},() => console.log(this.state));
      return;
    }
    if(templateId>=0 && templateId <= 7) {
      // 已选定模板
      if(path === "") {
        mapValueToKey(operationData[index], name, value);
      }else {
        mapValueToKey(operationData[index], `${path}.${name}`,value);
      }
      this.setState({operationData},() => console.log(this.state));
    }else {
      alert('请先选择模板');
    }
  };
  // 保存
  handleSave = () => {
    const { index , operationData} = this.state;
    const FORM_BLOCK = "form-block";
    fireForm(document.getElementById(FORM_BLOCK), "valid").then(validCode => {
      if(validCode){
        service.operation.saveOperation(operationData[index]).then(res => {
          console.log(res);
        })
      }else{

      }
    })
  };

  // 胎儿Tab Edit
  handleTabsEdit = (targetKey, action) => {
    const { operationData, index } = this.state;
    const { operative_procedure } = operationData[index];
    const { fetus } = operative_procedure;
    if( action === 'remove') {
      // remove
      let targetIndex = -1;
      for(let i = 0 ; i < fetus.length ; i++) {
        if(fetus[i].id === targetKey) { targetIndex = i; break; }
      }
      fetus.splice(targetIndex,1);
      operative_procedure['fetus'] = fetus;
    }else if( action === 'add') {
      // add
      const fetusKeysArr = Object.keys(fetus); const length = fetus.length;
      let newObj = {};
      fetusKeysArr.forEach(key => {
        newObj[key] = "";
      })
      newObj['id'] = (Number(fetus[length-1]['id'])+1).toString();
      operative_procedure['fetus'].splice(length,0,newObj);
    }
    this.setState({operationData});
  }
  // 胎儿Tab Click
  handleTabClick = (key) => {
    this.setState({currentFetusActiveKey: key});
  }

  // 处理 送检项目 补充信息 这里使用的 变量来自 state
  handleSJOtherContext = () => {
    const SJ_KEY = 'other2';
    const { operative_procedure, currentFetusActiveKey, otherContext } = this.state;
    // TODO
    const index = operative_procedure['fetus'].findIndex((item) => item.id === currentFetusActiveKey);
    // 送检项目 这个地方暂时写死
    console.log(operative_procedure['fetus'][index]['inspectionItems']);
    const otherIndex = operative_procedure['fetus'][index]['inspectionItems'].findIndex(i => i === SJ_KEY);

    operative_procedure['fetus'][index]['inspectionItems'].splice(otherIndex, 1, otherContext);
    this.setState({operative_procedure, otherContext: "",  isShowOtherContextModal: false});
  };






  /* ========================= 其他 ============================ */
  // 获取数据整合进入state
  convertOperationDetail = (object) => {
    let { operationData, currentTreeKeys } = this.state;
    let { operative_procedure, operationItem } = object;
    // string -> json
    Object.keys(operationItem).forEach(v => {
      operationItem[v] = convertString2Json(operationItem[v]);
    });
    object['preoperative_record']['bp'] = convertString2Json(object['preoperative_record']['bp']) || {};
    operative_procedure['fetus'].forEach(item => {
      const keys = Object.keys(item);
      keys.forEach(key => {
        if(item[key].indexOf('{')!==-1 && item[key].indexOf('}')!==-1){
          item[key] = convertString2Json(item[key]);
        }
      })
    });
    // 识别类型
    const templateId = operationItemTemplateId(operationItem['operationName']['label']);
    console.log(templateId);
    // 手动添加对应的key值
    object['key'] = currentTreeKeys[0];
    // 转换时间戳
    object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);

    object['preoperative_record']['bleedIndex'] = [object['preoperative_record']['bleedIndex']] || [];
    object['preoperative_record']['hemogram'] = [object['preoperative_record']['hemogram']] || [];
    object['preoperative_record']['measurement'] = [object['preoperative_record']['measurement']] || [];
    object['surgery']['bleedIndex'] = [object['surgery']['bleedIndex']] || [];
    object['surgery']['hemogram'] = [object['surgery']['hemogram']] || [];
    object['surgery']['measurement'] = [object['surgery']['measurement']] || [];
    // 判断数据列表中是否存在
    if(operationData.findIndex(item => item['key'] === object['key']) === -1) {
      operationData.push(object);
    }else{
      const index = operationData.findIndex(item => item.id === object.id);
      operationData.splice(index,1,object);
    }

    // NOTICE 先将templateId设置为-1，把formDOM先为空，否则会造成上一个templateId表单部分还在新生成元素中
    this.setState({templateId: -1},() => {
      const index = operationData.findIndex(item => item.key === currentTreeKeys[0]);
      this.setState({operationData,templateId, index}, () => console.log(this.state));
    });
  };
  // 检测data中是否存在这个key值
  checkIsGot = (dataList, object) => (
    dataList.findIndex((item) => item['key'] === object['key']) !== -1
  );



  render() {
    const { operationList, operationData, isShowOtherContextModal, isFetusPage, index } = this.state;
    const { otherContext } = this.state;
    let { templateId } = this.state;
    const renderData = operationData[index] || {
      id: -1,key: -1,
      operationItem: {}, preoperative_record: {}, operative_procedure: {fetus:[{id: '-1'}]}, surgery: {},
      ward: {}
    };
    // 当renderData.id < 0，模板属于新建状态，不可以渲染templateid===-1
    templateId = renderData.id < 0 ? 0 : templateId;
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

          {renderData.id < 0  ? (
            <div>
              <div className="btn-group">
                <ButtonGroup>
                  <Button type={isFetusPage ? "primary" : ""} onClick={() => this.setState({isFetusPage: true})}>胎儿中心</Button>
                  <Button type={isFetusPage ? "" : "primary"} onClick={() => this.setState({isFetusPage: false})}>病房</Button>
                </ButtonGroup>
              </div>
              <div>
                {isFetusPage ? (
                  <div>
                    <Collapse defaultActiveKey={["operationItem","preoperative_record","operative_procedure","surgery"]}>
                      <Panel header="手术项目" key="operationItem">
                        {formRender(renderData['operationItem'] || {},formRenderConfig[`config${templateId}`]['operationItem_config'](), (_,{name, value}) => this.handleFormChange("operationItem",name,value))}
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
                  ) : (
                  <div>
                    {formRender({}, formRenderConfig['ward_config'](), () => console.log('a'))}
                  </div>
                )}
              </div>
            </div>
            ) : (
            <div className="form-block">
              {(templateId>=0&&templateId<=7) ?  (
                  <div>
                    <Collapse defaultActiveKey={["operationItem","preoperative_record","operative_procedure","surgery"]}>
                      <Panel header="手术项目" key="operationItem">
                        {formRender(renderData['operationItem'] || {},formRenderConfig[`config${templateId}`]['operationItem_config'](), (_,{name, value}) => this.handleFormChange("operationItem",name,value))}
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
              ): (
                <div>
                  {formRender({}, formRenderConfig['ward_config'](), () => console.log('a'))}
                </div>
              )}
            </div>
            )
          }




          <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn" onClick={this.handleSave}>保存</Button>
          </div>
        </div>

        {/* 补充modal */}
        <div>
          <Modal
            style={{zIndex: 9999}}
            title="请输入补充信息"
            visible={isShowOtherContextModal}
            maskClosable={false}
            onOk={this.handleSJOtherContext}
            onCancel={() => this.setState({isShowOtherContextModal: false, otherContext: ''})}
          >
            <Input
              value={otherContext}
              onChange={(e) => this.setState({otherContext: e.target.value})}
            />
          </Modal>
        </div>

      </Page>
    );
  }
}
