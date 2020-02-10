import React,{ Component} from 'react';

import { Tree, Button, Collapse, Tabs, Modal, Input } from 'antd';
import Page from '../../render/page';

import formRender from '../../render/form.js';
import service from '../../service';

// Css
import './index.less';
import '../index.less';

// select 数据
import {
  yesOptions, nhOptions, characterOptions, statusOptions,
  operation_itemsOptions, operationLevelOptions, incisionTypeOptions, preoperativeUltrasonographyColumns, puncturePositionOptions,
  sjTreeOption
} from './data.js'
import {valid} from "../../render/common";

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

export default class Operation extends Component{
  constructor(props) {
    super(props);
    this.state = {
      // 左侧树形菜单
      operationList: [],

      // 数据
      operationItem: {
        incisionType: "",
        operationLevel: "",
        operationName: "",
        rePuncture: []
      },
      preoperative_record: {
        bP: "", operation_date: "",
        preoperativeUltrasonography: [],
        temperature: ""
      },
      operative_procedure: {
        fetus: [{
          id: "test-1",
          start_time: "00:00",
          end_time: "00:00",
        }],
      },
      ward: {},

      // 控制
      currentFetusActiveKey: "",  // 当前activeTab
      isFetusPage: true, // 现在处于哪一个病历页
      isShowOtherContextModal: false,
      otherContext: ""
    }
  }

  componentDidMount() {
    // 获取手术记录的json
    service.operation.getOperation().then(res => {
      // 将数据setState 进入 state 中
      if(res.code === '200' || 200) {
        this.setState({operationList: res.object.list}, () => {
          // 获取list后，默认获取第一个手术项目detail
          const { operationList } = this.state;
          // TODO 这里的key值暂时不知道用哪个 完成页面之后再做
          service.operation.getOperationdetail({recordid: operationList[0].children[0]['key']})
            .then(res => {
              if(res.code === 200 || "200") this.convertOperationDetail(res.object)
            });
        });
      }
    })
  }

  /* ========================= formRender渲染UI config  ============================ */
  /*
  * 胎儿中心部分
  * */
  // 手术项目
  operationItem_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {name: 'operationName[手术名称]', type: 'select', options: operation_itemsOptions, span: 6},
          {name: 'operationLevel[手术级别]', type: 'select', options: operationLevelOptions, span: 6},
          {name: 'incisionType[切口类型]', type: 'select', options: incisionTypeOptions, span: 6}
        ]
      },
      {
        columns: [
          {name: 'rePuncture[是否再次穿刺]', type: 'checkinput-5', radio: true, options: nhOptions }
        ]
      }
    ]
  });
  // 术前记录
  preoperative_record_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {name: 'operation_date[手术日期]', type: 'date', span:6},
          {name: 'temperature(℃)[体@@@温 ]', type: 'input', span:6},
          {name: 'bP(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 8, valid: (value)=>{
              let message = '';
              if(value){
                message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
              }else{

              }
              return message;
            }},

        ]
      },
      {
        columns: [
          { name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns, span: 20 },
        ]
      }
    ]
  });
  // 手术操作
  operative_procedure_config = () => ({
    step: 1,
    rows: [
      {
        columns: [
          {name: 'operation_no[手术编号]', type: 'input', span: 6},
          {name: 'operator[术者]', type: 'input', span: 6},
          {name: 'assistant[助手]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'start_time[开始时间]', type: 'time', placeholder: "", format: "HH:mm", span: 6},
          {name: 'end_time[结束时间]', type: 'time', placeholder: "", format: "HH:mm",span: 6},
          {name: 'duration[持续时间](min)', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'puncturePosition[穿刺部位]', type: 'select', options: puncturePositionOptions,span: 6},
          {name: 'jinrgqcs[进入宫腔次数]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'placenta[经否胎盘]', type: 'select',options: [{label: '经',value: '经'},{label: '否',value: '否'}], span: 6},
          {name: 'placentaHemorrhage[胎盘出血]', type: 'select', options: yesOptions, span: 6},
          {name: 'uterineWallHemorrhage[宫壁出血]', type: 'select',options: yesOptions, span: 6},
        ]
      },
      {
        columns: [
          {name: 'inspectionItems[送检项目]', type: 'treeselect', options: sjTreeOption,span: 6},
          {name: 'amniotic_fluid[羊水量](min)', type: 'input', span: 6},
          {name: 'character[性状]', type: 'select',options: characterOptions, span: 6},
        ]
      },
      {
        columns:[{label: '之后完善药物/用量输入框'}]
      },
      {
        columns: [
          {name: 'isPharmacy[是否用药](若选择有，请填写药物与用量)', type: 'checkinput', radio: true, options: nhOptions, span: 18}
        ]
      },
      {
        columns: [
          {name: 'process_evaluation[过程评估]', type: 'checkinput', radio:true, options:statusOptions, span: 20}
        ]
      },
      {
        columns: [
          {name: 'diagnosis[诊断]', type: 'textarea'}
        ]
      },
      {
        columns: [
          {name: 'special_case[特殊记录]', type: 'textarea'}
        ]
      }
    ]
  });
  // 术后情况
  afterOperation_config = () => ({
    step: 1,
    rows: [
      {
        columns: [{name: 'afterFhr[术后胎心率](bpm)', type: 'input', span: 24}]
      },
      {
        columns: [{name: 'doctors_advice[医后叮嘱]', type: 'textarea', span: 24}]
      }
    ]
  });
  /*
  * 病房部分
  * */
  // 患者信息
  ward_config = () => ({
    step: 1,
    rows: [
      {columns: [{label: '患者信息'}]},
      {
        columns: [
          {name: 'name[姓名]', type: 'input', span: 6},
          {name: 'dept[科室]', type: 'input', span: 6},
          {name: 'inpatientNo[住院号]', type: 'input', span: 6},
          {name: 'bedNo[床号]', type: 'input', span: 6}
        ]
      },
      {columns: [{label: '手术项目'}]},
      {
        columns: [
          {name: 'operationNameWard[手术名称]', type: 'checkinput', options: operation_itemsOptions},
          {name: 'operationLevelWard[手术级别]', type: 'select', options: operationLevelOptions, span: 6},
          {name: 'incisionTypeWard[切口类型]', type: 'select', options: incisionTypeOptions, span: 6},
        ]
      },
      {
        columns: [
          {name: 'preoperativeDiagnosis[术前诊断]', type: 'textarea', span: 24}
        ]
      },
      {
        columns: [
          {name: 'intraoperativeDiagnosis[术中诊断]', type: 'textarea', span: 24}
        ]
      },
      {columns: [{label: '手术操作'}]},
      {
        columns: [
          {name: 'operationDate[手术日期]', type: 'date', span: 6},
          {name: 'startTime[开始时间]', type: 'time', placeholder: '', format: "HH:mm", span: 6},
          {name: 'endTime[结束时间]', type: 'time', placeholder: '', format: "HH:mm", span: 6},
        ]
      },
      {
        columns: [
          {name: 'operationNo[手术编号]', type: 'input', span: 6},
          {name: 'operator[术者]', type: 'input', span: 6},
          {name: 'assistant[助手]', type: 'input', span: 6},
        ]
      },
      {
        columns: [
          {name: 'anesthesiaMethod[麻醉方法]', type: 'input', span: 6},
          {name: 'anesthesiologist[麻醉医师]', type: 'input', span: 6},
          {name: 'instrumentNurse[器械护士]', type: 'input', span: 6},
        ]
      },
      {
        columns:[{name: 'operationProcedure[手术经过]', type: 'textarea'}]
      }
    ]
  });

  /* ========================= 渲染方法 ============================ */
  // 渲染左侧手术记录树
  renderTree = (data) => {
    let tnDOM = [];
    if(data.length === 0) {
      return <div>无手术记录</div>;
    }
    data.forEach(item => {
      tnDOM.push(
        <TreeNode title={item['title'].slice(0,12)} key={item['key']}>
          {item['children'].map(v => (
            <TreeNode title={v['title']} key={v['key']}/>
          ))}
        </TreeNode>
      )
    });
    return <Tree onSelect={this.handlerTreeSelect} defaultExpandAll>{tnDOM}</Tree>;
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
  }
  /* ========================= 事件交互 ============================ */
  // 选择树形菜单获取病例
  handlerTreeSelect = (selectedKeys, {node}) => {
    if(node.props.children) {
      return ;
    }

    if(selectedKeys.length !== 0) {
      service.operation.getOperationdetail({specialtyRecordTreeId: selectedKeys[0]})
        .then(res => {
          console.log(res);
          if(res.code === 200 || "200") this.convertOperationDetail(res.object)
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
  // 处理 送检项目 补充信息
  // 这里使用的 变量来自 state
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
    const { operative_procedure } = object;
    this.setState({...object});
    this.setState({currentFetusActiveKey: operative_procedure['fetus'][0].id});
  };

  modalGetFocus = () => {

  }

  render() {
    const { operationList, isFetusPage, currentFetusActiveKey, isShowOtherContextModal } = this.state;
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
          <div>
            {/* 渲染哪一个病例 */}
            {isFetusPage ? (
              <Collapse defaultActiveKey={["f-0","f-1","f-2","f-3"]}>
                <Panel header="手术项目" key="f-0">
                  {formRender(operationItem, this.operationItem_config(), () => console.log('c'))}
                </Panel>
                <Panel header="术前记录" key="f-1">
                  {formRender(preoperative_record, this.preoperative_record_config(), () => console.log('c'))}
                </Panel>
                <Panel header="手术操作" key="f-2">
                  <Tabs
                    active={currentFetusActiveKey}
                    onTabClick={this.handleTabClick}
                    type="editable-card"
                    onEdit={this.handleTabsEdit}
                  >
                    {this.renderFetusTabPane(operative_procedure['fetus'])}
                  </Tabs>
                </Panel>
                <Panel header="术后情况" key="f-3">
                  {formRender({afterFhr,doctors_advice}, this.afterOperation_config(), () => console.log('e'))}
                </Panel>
              </Collapse>
            ) : (
              <div className="bgWhite" style={{padding: "10px"}}>
                {formRender(ward, this.ward_config(), () => console.log('c'))}
              </div>
            )}
          </div>
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