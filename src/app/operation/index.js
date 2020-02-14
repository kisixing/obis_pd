import React,{ Component} from 'react';

import { Tree, Button, Collapse, Tabs, Modal, Input } from 'antd';
import Page from '../../render/page';

import formRender from '../../render/form.js';
import valid from '../../render/common/valid.js';
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
  console.log(resArr);
  return resArr;
};

export default class Operation extends Component{
  constructor(props) {
    super(props);
    this.state = {
      // 左侧树形菜单
      operationList: [],
      operationDataList: [],


      // 控制
      currentTreeKeys: [],
      templateId: -1,     // 模板id
      currentFetusActiveKey: "",  // 当前activeTab
      isFetusPage: true, // 现在处于哪一个病历页
      isShowOtherContextModal: false,
      otherContext: ""
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
  renderFetusTabPane = (fetusData) => {
    if(fetusData.length === 0) return <div key="none">暂无数据</div>;
    const fetusTabPaneDOM = [];
    fetusData.forEach((fetus,index) => {
      fetusTabPaneDOM.push(
        <TabPane key={fetus.id} tab={`胎儿-${index+1}`}>
          {formRender(fetus,this.operative_procedure_config(),this.handleChange)}
        </TabPane>
      );
    })
    return fetusTabPaneDOM;
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
          console.log(res);
          if(res.code === 200 || "200"){
            this.setState({currentTreeKeys: selectedKeys});
            this.convertOperationDetail(res.object)
          }
        });
    }
  };
  // 胎儿Tab Edit
  handleTabsEdit = (targetKey, action) => {
    const { operative_procedure } = this.state;
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
    this.setState({operative_procedure});
  }
  // 胎儿Tab Click
  handleTabClick = (key) => {
    this.setState({currentFetusActiveKey: key});
  }
  // formRender 元素
  handleChange = (_,{ name, value }) => {
    const SJ_KEY = 'other2';
    // 送检项目 特别处理
    if(name === "inspectionItems" && value.findIndex((i) => i === SJ_KEY) !== -1){
      const { operative_procedure, currentFetusActiveKey } = this.state;
      const index = operative_procedure['fetus'].findIndex((item) => item.id === currentFetusActiveKey);
      operative_procedure['fetus'][index]['inspectionItems'] = value;
      this.setState({isShowOtherContextModal: true, operative_procedure});
    }
  };
  // 处理 送检项目 补充信息 这里使用的 变量来自 state
  handleSJOtherContext = () => {
    const SJ_KEY = 'other2';
    const { operative_procedure, currentFetusActiveKey, otherContext } = this.state;
    const index = operative_procedure['fetus'].findIndex((item) => item.id === currentFetusActiveKey);
    // 送检项目 这个地方暂时写死
    console.log(operative_procedure['fetus'][index]['inspectionItems']);
    const otherIndex = operative_procedure['fetus'][index]['inspectionItems'].findIndex(i => i === SJ_KEY);
    console.log(otherIndex);
    operative_procedure['fetus'][index]['inspectionItems'].splice(otherIndex, 1, otherContext);
    this.setState({operative_procedure, otherContext: "",  isShowOtherContextModal: false});
  }
  /* ========================= 其他 ============================ */
  // 获取数据整合进入state
  convertOperationDetail = (object) => {
    const { operationDataList, currentTreeKeys } = this.state;
    const { operative_procedure, operationItem } = object;
    // 识别类型
    const templateId = operationItemTemplateId(operationItem['operationName']);
    // string -> json
    object['operationItem']['rePuncture'] = convertString2Json(operationItem['rePuncture']);
    object['preoperative_record']['bp'] = convertString2Json(object['preoperative_record']['bp']) || {};
    // 手动添加对应的key值
    object['key'] = currentTreeKeys[0];
    // 转换时间戳
    object['preoperative_record']['operation_date'] = new Date(object['preoperative_record']['operation_date']);
    // 判断数据列表中是否存在
    if(!this.checkIsGot(operationDataList,object)) {
      operationDataList.push(object);
    }else{
      // TODO 之后优化吧
      const index = operationDataList.findIndex(item => item.id === object.id);
      operationDataList.splice(index,1,object);
    }
    this.setState({operationDataList,templateId},() => {
      console.log(this.state);
    });
  };
  // 检测data中是否存在这个key值
  checkIsGot = (dataList, object) => (
    dataList.findIndex((item) => item['key'] === object['key']) !== -1
  );
  // 根据templateId组装数据
  assembledRenderData = (templateId, currentTreeKey) => {
    const { operationDataList } = this.state;
    const index = operationDataList.findIndex((item) => item['key'] === currentTreeKey);
    console.log(index);
    console.log(operationDataList);
    return  operationDataList[index];
    // console.log(targetData);
    // let renderData = {
    //   operationItem: targetData
    // };
    // switch (templateId) {
    //   case 0:
    //     break;
    //   case 1:
    //     break;
    //   case 2:
    //     break;
    //   case 3:
    //     break;
    //   case 4:
    //     break;
    //   case 5:
    //     break;
    //   case 6:
    //     break;
    //   case 7:
    //     break;
    // }
  }


  render() {
    const { operationList, isFetusPage, isShowOtherContextModal, templateId, currentTreeKeys } = this.state;
    const { operationItem, preoperative_record, operative_procedure, afterFhr, doctors_advice, ward } = this.state;
    const { otherContext } = this.state;
    return (
      <Page className="fuzhen font-16">
        <div className="fuzhen-left ant-col-5">
          {/* 这里无用的重新渲染问题 */}
        {this.renderTree(operationList)}

        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7">
          <div className="btn-group">
            <ButtonGroup>
              <Button type={isFetusPage ? "primary" : ""} onClick={() => this.setState({isFetusPage: true})}>胎儿中心</Button>
              <Button type={isFetusPage ? "" : "primary"} onClick={() => this.setState({isFetusPage: false})}>病房</Button>
            </ButtonGroup>
          </div>
          {/*
            * 1 - 根据templateId组合属性
            * 2 - 赋值
            */}
          {
            ((templateId,currentTreeKeys) => {
              if(templateId < 0) return <div>尚未选择</div>
              // 组装数据
              const renderData = this.assembledRenderData(templateId, currentTreeKeys[0]);
              return (<div>
                <div>
                  {formRender(renderData['operationItem'],formRenderConfig[`config${templateId}`]['operationItem_config'](), () => console.log('change'))}
                </div>
                <div>
                  {formRender(renderData['preoperative_record'],formRenderConfig[`config${templateId}`]['preoperative_record_config'](), () => console.log('change'))}
                </div>
                <div>
                  <Tabs>
                    {
                      renderData['operative_procedure']['fetus'].map((item, index) => (
                        <TabPane tab={`胎儿${index+1}`} key={item.id}>
                          {formRender(item, formRenderConfig[`config${templateId}`]['operative_procedure_config'](), () => console.log('a'))}
                        </TabPane>
                      ))
                    }
                  </Tabs>
                </div>
                {/*{formRender(renderData['operationItem'],formRenderConfig[`operationItem${templateId}`], () => console.log('change'))}*/}
                <div>
                  {formRender(renderData['surgery'],formRenderConfig[`config${templateId}`]['surgery_config'](), () => console.log('change'))}
                </div>

              </div>)
            })(templateId,currentTreeKeys)
          }
          {/*<Tabs>*/}
          {/*  <TabPane key='config0' tab="羊膜穿刺">*/}
          {/*    {formRender({}, formRenderConfig.config0.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config0.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config0.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config0.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*  <TabPane key='config1' tab="绒毛活检">*/}
          {/*    {formRender({}, formRenderConfig.config1.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config1.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config1.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config1.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*  <TabPane key='config2' tab="脐带穿刺">*/}
          {/*    {formRender({}, formRenderConfig.config2.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config2.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config2.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config2.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*  <TabPane key='config3' tab="羊膜腔灌注">*/}
          {/*    {formRender({}, formRenderConfig.config3.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config3.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config3.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config3.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*  <TabPane key='config4' tab="选择性减胎">*/}
          {/*    {formRender({}, formRenderConfig.config4.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config4.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config4.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config4.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*  <TabPane key='config5' tab="羊水减量">*/}
          {/*    {formRender({}, formRenderConfig.config5.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config5.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config5.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config5.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane><TabPane key='config6' tab="宫内输血">*/}
          {/*  {formRender({}, formRenderConfig.config6.operationItem_config(), this.handleChange)}*/}
          {/*  {formRender({}, formRenderConfig.config6.preoperative_record_config(), this.handleChange)}*/}
          {/*  {formRender({}, formRenderConfig.config6.operative_procedure_config(), this.handleChange)}*/}
          {/*  {formRender({}, formRenderConfig.config6.surgery_config(), this.handleChange)}*/}
          {/*</TabPane>*/}
          {/*  <TabPane key='config7' tab="胸腔积液、腹水、囊液抽吸">*/}
          {/*    {formRender({}, formRenderConfig.config7.operationItem_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config7.preoperative_record_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config7.operative_procedure_config(), this.handleChange)}*/}
          {/*    {formRender({}, formRenderConfig.config7.surgery_config(), this.handleChange)}*/}
          {/*  </TabPane>*/}
          {/*</Tabs>*/}

          <div className="btn-group pull-right bottom-btn">
            <Button className="blue-btn">打印</Button>
            <Button className="blue-btn">重置</Button>
            <Button className="blue-btn">保存</Button>
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
        {/*  新建病例modal */}
        <div>
        </div>
      </Page>
    );
  }
}