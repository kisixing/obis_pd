import React, { Component } from 'react';
import { Table, Button, Input } from 'antd';

import service from '../../service/';

import './index.less';


/**
 * props
 * @data {doctor: string, type: string}
 * @getData () => string
 */

const NEW_TEMPLATE = 'newTemplate'

class TemplateInput extends Component {
  static count = 0;
  constructor(props) {
    super(props);
    this.state = {
      templateList: [],
      currentSelection: [],
      currentInput: '',
      isNewTemplate: false,
      currentTemplateData: {
        doctor: "",
        type: ""
      } // 包含doctor和type字段
    };
  }

  componentDidMount() {
    let { doctor = "test", type } = this.props.data;
    console.log(doctor);
    if(doctor === "") {
      doctor = "test";
    }
    this.setState({ currentTemplateData: { doctor, type } }, () => this.getTemplateList());
  }

  // 输入会触发这个方法，可以考虑优化
  componentDidUpdate(prevProps, prevState, snapshot) {
    let { doctor, type } = this.props.data;
    if (prevProps.data.doctor !== doctor || prevProps.data.type !== type) {
      // 用于请求
      if(doctor === "") {doctor = "test"}
      this.setState({ currentTemplateData: { doctor, type } }, () => {
        this.getTemplateList();
      });
    }
  }

  /* ===================  =================== */
  getTemplateList = () => {
    const { currentTemplateData } = this.state;
    service.template.getTemplate(currentTemplateData).then(res => {
      const { object } = res;
      this.setState({ templateList: object, currentSelection: object.length !== 0 ? [object[0]['key']] : [], isNewTemplate: false })
    })
  };

  sortTemplate = (sortAction) => {
    const { currentSelection } = this.state;
    if (currentSelection.length !== 0) {
      service.template.sortTemplate({ key: currentSelection[0], sortAction }).then(res => {
        this.getTemplateList();
      })
    }
  };

  /* =================== 表格相关渲染与配置 =================== */
  renderTableCell = (text, record) => {
    if (record.key.indexOf(NEW_TEMPLATE) !== -1) return <Input onChange={(e) => this.setState({ currentInput: e.target.value })} />
    return <span>{text}</span>
  };

  tableColumns = () => ([
    { title: '全选', key: 'checkbox' },
    { title: '内容', dataIndex: 'content', key: 'content', render: this.renderTableCell }]
  );

  rowSelection = () => ({
    type: 'checkbox',
    selectedRowKeys: this.state.currentSelection,
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({ currentSelection: selectedRowKeys });
    }
  });
  /* =================== 操作 =================== */
  // 新增 或 保存
  handleNewOrSave = () => {
    const { templateList, isNewTemplate, currentInput, currentTemplateData } = this.state;
    if (isNewTemplate) {
      // 保存病历
      if (currentInput !== "") {
        service.template.addTemplate({ content: currentInput, ...currentTemplateData }).then(res => {
          this.getTemplateList();
          this.setState({ isNewTemplate: !isNewTemplate });
        })
      }
    } else {
      templateList.push({ key: `${NEW_TEMPLATE}${Math.random()}`, content: '' });
      this.setState({ templateList, isNewTemplate: !isNewTemplate });
    }
  };
  // 取消 或 删除
  handleCancelOrDelete = () => {
    let { templateList } = this.state;
    const { isNewTemplate, currentSelection } = this.state;
    if (isNewTemplate) {
      // Cancel
      templateList.pop();
      this.setState({ templateList, isNewTemplate: !isNewTemplate, currentInput: '' });
    } else if (!isNewTemplate) {
      // Delete - 同时需要删除2个模板，需要和后端协商
      let deleteTempaltes = [];
      currentSelection.forEach(key => {
        const index = templateList.findIndex(item => item.key === key);
        if(index !== -1) {
          deleteTempaltes.push({key: templateList[index].key})
        }
      })
      console.log(currentSelection);
      service.template.deleteTemplate(deleteTempaltes).then(res => {
        this.getTemplateList();
      })
    }
    // this.setState({templateList, isNewTemplate: !isNewTemplate, currentInput: ''});
  };

  // 传出给父组件 - 传出多个对象
  submitData = () => {
    const { currentSelection, templateList } = this.state;
    const { getData } = this.props;
    let resArr = [];
    currentSelection.forEach(key => {
      const index = templateList.findIndex(item => item.key === key);
      if(index !== -1){
        resArr.push(templateList[index]);
      }
    })
    // const index = templateList.findIndex(item => item.key === currentSelection[0]);
    getData(resArr);
  };

  render() {
    const { isNewTemplate, currentSelection } = this.state;
    return (
      <div className='template-input'>
        <div className='table-block'>
          <Table
            rowSelection={this.rowSelection()}
            columns={this.tableColumns()}
            dataSource={this.state.templateList}
          />
          <Button className="choice-btn" disabled={currentSelection.length === 0 || isNewTemplate} onClick={this.submitData}>选择模板</Button>
        </div>

        <div className='btn-block'>
          <Button disabled={isNewTemplate || currentSelection.length > 1} onClick={() => this.sortTemplate(1)}>向上移动</Button>
          <Button disabled={isNewTemplate || currentSelection.length > 1} onClick={() => this.sortTemplate(2)}>向下移动</Button>
          <Button onClick={this.handleNewOrSave}>{isNewTemplate ? <span>保存模板</span> : <span>新增模板</span>}</Button>
          <Button onClick={this.handleCancelOrDelete}>{isNewTemplate ? <span>取消新增</span> : <span>删除模板</span>}</Button>
          
        </div>
      </div>
    )
  }
}

export default TemplateInput;
