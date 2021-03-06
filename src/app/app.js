import React, { Component } from "react";
import { Row, Col, Input, Button, Select, Modal, Tree, Icon, message } from 'antd';

import router from "../utils/router";
import bundle from "../utils/bundle";
import service from '../service';

import store from './store';
import { closeAlertAction, setUserData } from './store/actionCreators.js';

// page Component
import Pregnancy from 'bundle-loader?lazy&name=pregnancy!./pregnancy';
import MedicalRecord from 'bundle-loader?lazy&name=medicalrecord!./medicalrecord';
import Operation from 'bundle-loader?lazy&name=operation!./operation';
import Lis from 'bundle-loader?lazy&name=lis!./lis';
import Pacs from 'bundle-loader?lazy&name=pacs!./pacs';
import HistoricalRecord from 'bundle-loader?lazy&name=historicalrecord!./historicalrecord';
import Outcome from 'bundle-loader?lazy&name=outcome!./outcome';
import OpenCase from 'bundle-loader?lazy&name=opencase!./opencase';

import "./app.less";

const ButtonGroup = Button.Group;

const routers = [
  { name: '基本信息', path: '/pregnancy', component: bundle(Pregnancy) },
  { name: '专科病历', path: '/medicalrecord', component: bundle(MedicalRecord) },
  { name: '手术记录', path: '/operation', component: bundle(Operation) },
  { name: '检验报告', path: '/lis', component: bundle(Lis) },
  { name: '影像报告', path: '/pacs', component: bundle(Pacs) },
  { name: '历史病历', path: '/historicalrecord', component: bundle(HistoricalRecord) },
  { name: '分娩结局', path: '/outcome', component: bundle(Outcome) },
  { name: '孕妇建册', path: '/opencase', component: bundle(OpenCase) }
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      highriskList: [],
      highriskEntity: null,
      highriskShow: false,
      menuIndex: 0, // 默认 pregnancy
      userData: {},
      highriskAlert: [],
      searchObj: {
        menzhenNumber: "", IDCard: "", phoneNumber: ""
      }
    };
    store.subscribe(() => this.handleStoreChange());
  }

  handleStoreChange = () => {
    const { userData } = store.getState();
    // 当本页面userid与store不同
    if( this.state.userData.userid !== userData.userid) {
      this.findUser("","","","",userData.userid);
    }
  };

  componentDidMount() {
    const { location = {} } = this.props;
    const { menuIndex } = this.state;
    if (location.pathname !== routers[menuIndex].path) {
      this.props.history.push(routers[menuIndex].path);
    }
    this.componentWillUnmount = service.watchInfo((info) => this.setState(info.object));
  }

  /**
 * 高危弹出窗口
 */
  renderHighrisk() {
    const { highriskAlert, userid } = this.state;
    const handelClose = (index, params) => {
      const action = closeAlertAction(index);
      store.dispatch(action);
      if (params) {
        service.closeHighriskAlert(userid, params).then(res => { })
      }
    };

    const addHighrisk = (highrisk, level, index) => {
      const action = closeAlertAction(index);
      store.dispatch(action);
      service.addHighrisk(userid, highrisk, level).then(res => { })
    }

    return (highriskAlert && highriskAlert.length > 0 ?
      highriskAlert.map((item, index) => (
        item.alertMark == 1 && item.visible ?
          <div className="highrisk-wrapper">
            <div>
              <span className="exc-icon"><Icon type="exclamation-circle" style={{ color: "#FCCD68" }} /> 请注意！</span>
              <span className="close-icon pull-right" onClick={() => { handelClose(index) }}><Icon type="close" /></span>
            </div>
            <div className="highrisk-content">
              <div>孕妇诊断有<span className="highrisk-word">{item.content}</span>,请标记高危因素</div>
              <div className="highrisk-item">
                {item.items.map(subItem => (
                  <Button className="blue-btn margin-R-1 margin-TB-mid" type="ghost" onClick={() => addHighrisk(subItem.highrisk, subItem.level, index)}>{subItem.name}</Button>
                ))}
              </div>
              <div><Button className="blue-btn colorGray margin-R-1" type="ghost" onClick={() => handelClose(index, item.content)}>关闭，不再提示</Button>
                <Button className="blue-btn colorGray" type="ghost" onClick={() => handelClose(index)}>关闭</Button></div>
            </div>
          </div>
          : null
      ))
      : null
    );
  }

  // 路由跳转
  handleRouteSwitch(item, i) {
    if (item.component) {
      this.setState({ menuIndex: i });
      this.props.history.push(item.path);
    }
  }
  // 改变搜索内容
  handleSearchContent = (key, value) => {
    const { searchObj } = this.state;
    let obj = Object.assign({}, searchObj);
    obj[key] = value;
    this.setState({searchObj: obj});
  }
  resetSearch = () => {
    this.setState({searchObj:{
      menzhenNumber: "", IDCard: "", phoneNumber: ""
    }})
  }
  // 孕妇建册
  toOpenCase = () => {
    this.props.history.push('/opencase');
    this.setState({ menuIndex: -1 });
  }

  renderHeader() {
    const { username, userage, tuserweek, tuseryunchan, gesexpect, usermcno, chanjno, risklevel, infectious } = this.state.userData;
    const { menzhenNumber, IDCard, phoneNumber } = this.state.searchObj;
    return (
      <div className="main-header">
        <div className="patient-Info_title font-16">
          <div><strong>姓名:</strong>{username}</div>
          <div><strong>年龄:</strong>{userage}</div>
          <div><strong>孕周:</strong>{tuserweek}</div>
          <div><strong>孕产:</strong>{tuseryunchan}</div>
          <div><strong>预产期:</strong>{gesexpect}</div>
          <div><strong>门诊号:</strong>{usermcno}</div>
          <div><strong>病例号:</strong>{chanjno}</div>
          <div><strong>多胎号:</strong></div>
        </div>
        {/* 这里做个搜索栏 */}
        <div className="search-block patient-Info_title">
          <div>
            <strong>门诊号:</strong>
            <Input value={menzhenNumber} onChange={(e) => this.handleSearchContent('menzhenNumber' ,e.target.value)} />
          </div>
          <div>
            <strong>身份证:</strong>
            <Input value={IDCard} onChange={(e) => this.handleSearchContent('IDCard' ,e.target.value)} />
          </div>
          <div>
            <strong>手机:</strong>
            <Input value={phoneNumber} onChange={(e) => this.handleSearchContent('phoneNumber' ,e.target.value)} />
          </div>
          <div className="search-btn">
            <Button onClick={this.handleSearch}>搜索</Button>
            <Button onClick={this.resetSearch}>重置</Button>
            <Button onClick={this.toOpenCase}>建册</Button>
          </div>
        </div>

        <p className="patient-Info_tab">
          {routers.map((item, i) => {
            if (item.name === '孕妇建册') return null;
            return (
            <Button key={"mune" + i} type={this.state.menuIndex != i ? 'dashed' : 'primary'} onClick={() => this.handleRouteSwitch(item,i)}>
              {item.name}
            </Button>)
          })}
        </p>
        <div className="patient-Info_btnList">
          <ButtonGroup onClick={() => this.setState({ highriskShow: true })}>
            <Button className="danger-btn-5">{risklevel}</Button>
            <Button className="danger-btn-infectin">{infectious}</Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  renderDanger() {
    const { highriskList, highriskShow, highriskEntity } = this.state;
    const searchList = highriskEntity && highriskList.filter(i => !highriskEntity.search || i.name.indexOf(highriskEntity.search) !== -1);
    const handleOk = () => {
      this.setState({ highriskShow: false });
      console.log('保存高危数据: ', highriskEntity);
    };
    const handleChange = (name, value) => {
      highriskEntity[name] = value;
      this.setState({ highriskEntity });
    }
    const handleSelect = (keys) => {
      const node = searchList.filter(i => i.id == keys[0]).pop();
      const gettitle = n => {
        const p = searchList.filter(i => i.id === n.pId).pop();
        if (p) {
          return [...gettitle(p), n.name];
        }
        return [n.name];
      }
      if (node && !searchList.filter(i => i.pId === node.id).length && highriskEntity.highrisk.split('\n').indexOf(node.name) === -1) {
        handleChange('highrisk', highriskEntity.highrisk.replace(/\n+$/, '') + '\n' + gettitle(node).join(':'));
      }
    };
    const initTree = (pid, level = 0) => searchList.filter(i => i.pId === pid).map(node => (
      <Tree.TreeNode key={node.id} title={node.name} onClick={() => handleCheck(node)} isLeaf={!searchList.filter(i => i.pId === node.id).length}>
        {level < 10 ? initTree(node.id, level + 1) : null}
      </Tree.TreeNode>
    ));

    return highriskEntity ? (
      <Modal className="highriskPop" title="高危因素" visible={highriskShow} width={1000} maskClosable={true} onCancel={() => this.setState({ highriskShow: false })} onOk={() => handleOk()}>
        <div>
          <Row>
            <Col span={2}></Col>
            <Col span={20}>
              <Row>
                <Col span={3}>高危等级：</Col>
                <Col span={7}><Select value={highriskEntity.risklevel} onChange={e => handleChange('risklevel', e)}>{'Ⅰ,Ⅱ,Ⅲ,Ⅳ,Ⅴ'.split(',').map(i => <Select.Option value={i}>{i}</Select.Option>)}</Select></Col>
                <Col span={2}>传染病：</Col>
                <Col span={10}><Select multiple value={highriskEntity.infectious && highriskEntity.infectious.split(',')} onChange={e => handleChange('infectious', e.join())}>{'<乙肝大三阳,乙肝小三阳,梅毒,HIV,结核病,重症感染性肺炎,特殊病毒感染（H1N7、寨卡等）,传染病：其他'.split(',').map(i => <Select.Option value={i}>{i}</Select.Option>)}</Select></Col>
              </Row>
              <br />
              <Row>
                <Col span={3}>高危因素：</Col>
                <Col span={16}><Input type="textarea" rows={5} value={highriskEntity.highrisk} onChange={e => handleChange('highrisk', e.target.value)} /></Col>
                <Col span={1}></Col>
                <Col span={2}><Button size="small" onClick={() => handleChange('highrisk', '')}>重置</Button></Col>
              </Row>
              <br />
              <Row>
                <Col span={16}><Input value={highriskEntity.search} onChange={e => handleChange('search', e.target.value)} placeholder="输入模糊查找" /></Col>
                <Col span={3}><Button size="small" onClick={() => handleChange('expandAll', false)}>全部收齐</Button></Col>
                <Col span={3}><Button size="small" onClick={() => handleChange('expandAll', true)}>全部展开</Button></Col>
              </Row>
            </Col>
          </Row>
          <div style={{ height: 200, overflow: 'auto', padding: '0 16px' }}>
            <Tree defaultExpandAll={highriskEntity.expandAll} onSelect={handleSelect} style={{ maxHeight: '90%' }}>{initTree(0)}</Tree>
          </div>
        </div>
      </Modal>
    ) : null;
  }

  // 处理搜索
  handleSearch = () => {
    const { menzhenNumber, IDCard, phoneNumber } = this.state.searchObj;
    const { menuIndex } = this.state;
    if(menuIndex !== 0){
      this.setState({menuIndex: 0}, () => this.handleRouteSwitch(routers[0]));
    }      
    this.findUser(menzhenNumber, IDCard, phoneNumber, "", "");
  };
  // id - userid
  findUser = (menzhenNumber, IDCard, phoneNumber, chanjno, id) => {
    service.findUser({ usermcno: menzhenNumber, useridno: IDCard, usermobile: phoneNumber, chanjno, id }).then(res => {
      // 在service中处理了2个 记住！！！
      if(!res.object.userid) {
        message.warning('无相关信息，请确认已经进行建册');
        return;
      } 
      const { yunc, chanc, usermcno, useridno, usermobile } = res.object;
      // 处理孕产
      res.object['tuseryunchan'] = `${yunc}/${chanc}`;
      // 填充本地输入框
      let newSearchObj = {menzhenNumber: usermcno,IDCard: useridno,phoneNumber: usermobile}
      // 设置storeuserData + 孕产信息
      store.dispatch(setUserData(res.object));
      this.setState({ userData: res.object,searchObj: newSearchObj, menuIndex: 0});
    })
  }

  render() {
    // const { isFetching } = store.getState();
    return (
      <div className='main-body'>
        {this.renderHeader()}
        <div className="main-content">
          {router(routers.filter(i => !!i.component))}
        </div>
        <div>
          {this.renderDanger()}
        </div>
        {this.renderHighrisk()}
        {/* <div>
          <Modal
            visible={isFetching}
            maskClosable={false}
            footer={null}
          >
            <div><span>数据请求中</span></div>
          </Modal>
        </div> */}
      </div>
    )
  }
}
