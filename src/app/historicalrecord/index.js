import React,{ Component } from 'react';
import { Tree } from 'antd';
import Page from '../../render/page';

import service from '../../service/index';

import './index.less';
import '../index.less';

const { TreeNode } = Tree;

/**
* 此页面不需要修改，所以
* */
export default class HistoricalRecord extends Component{
  constructor(props) {
    super(props);
    this.state = {
      historicalRecordList: {}, // 历史记录树形结构数据
      // control
      currentTreeKeys: [] // 当前选中的treeNodeKey
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
    // 这个页面应该没有待完善
    // if(Number(selectedKeys[0]) < 0) {
    //   console.log('不允许待完善请求');
    //   this.setState({currentTreeKeys: selectedKeys});
    //   return ;
    // }
    // 请求数据

  };

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
      >
        <TreeNode title="本次孕期" key="currentHistoricalRecords">
          {currentHistoricalRecords !== null && currentHistoricalRecords.hasOwnProperty('historicalRecordsDates') ? (
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
  }

  render() {
    const { historicalRecordList } = this.state;
    return (
      <Page className="fuzhen font-16 ant-col ">
        <div className="fuzhen-left ant-col-5">
          {this.renderTree(historicalRecordList)}
        </div>
        <div className="fuzhen-right ant-col-19 main main-pad-small width_7">

        </div>
      </Page>
    );
  }
}