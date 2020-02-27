import React,{ Component} from 'react';
import { Table, Input, Button } from 'antd';


/*============================ ==============================*/

/**
 * 1 对外接口还没有做 
 * 2 空新增问题还没有做
 */

// 按键名拿index
function searchIndex(arr,key,value) {
  const len = arr.length;
  let tarIndex = -1;
  for(let i = len - 1; len >= 0 ; i--){
    if(arr[i][key] === value) {
      tarIndex = i;
      break;
    }
  }
  return tarIndex < 0 ? false : tarIndex;
}


/**
 * {columns,dataSource,newTemplate(),deteleTemplate}  - from props
 *  - columns 中不写render 由本组件重写
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 是否新建模板
      isNewTemplate: false,
      // 当前编辑模板
      currentTemplate: {key:'', content: ''},
      // 当前选中行
      currentRowSelection: -1
    }  
  }

  // 重置state中值
  resetMyState = () => {
    // 赋予currentTemplate与dataSource中相同的结构
    const { dataSource } = this.props;
    let newCurrentTemplate = {}, newDataSource = [];
    Object.assign(newCurrentTemplate,dataSource[0]);
    Object.assign(newDataSource,dataSource);
    for(let key in newCurrentTemplate) {
      newCurrentTemplate[key] = "";
    }
    this.setState({
      dataSource:newDataSource,
      currentRowSelection:dataSource[0].key,
      currentTemplate: newCurrentTemplate
    })
  }

  componentDidMount() {
    // 将dataSource放入state，以便以后的操作
    this.resetMyState();
  }

  componentDidUpdate(prevProps) { 
    // TODO 这里的判断要改
    if(prevProps.dataSource.length === 0){
      this.resetMyState();
    }
  }

  // 渲染表格中的元素 应用于新增输入
  tableCellRender = (text, index, key) => {
    const { isNewTemplate, dataSource } = this.state;
    if(isNewTemplate){
      let { currentTemplate } = this.state;
      // 此次必为最后一项 先使用state中的current保存，届时再抽出封装
      return (index === dataSource.length - 1 ) ? (
      <input onChange={(e) => {
        currentTemplate[key] = e.target.value;
        this.setState({currentTemplate})
      }}/>
      ) :(<span>{text}</span>)
    }
    return <span>{text}</span>;    
  }

  // 可以考虑从父组件传入
  handleRowSelection = (selectedRowKeys, selectedRows) => {
    if(selectedRows[0].key !== selectedRowKeys) {
      this.setState({currentRowSelection: selectedRowKeys[0]});
    }
  }

  // 新增 或 保存模板
  newOrSaveTemplate = () => {
    const { isNewTemplate, dataSource } = this.state;
    let len = dataSource.length;
    if(!isNewTemplate) {
      // 进入新增
      const { currentTemplate } = this.state;
      dataSource.splice(len,0,currentTemplate);
      this.setState({isNewTemplate: !isNewTemplate,dataSource});
    }else{
      const { newTemplate } = this.props;
      // 保存
      const { currentTemplate } = this.state;
      if(currentTemplate.content) {
        // 传出父组件
        newTemplate(currentTemplate,dataSource);
        // 下面的用于效果展示
        // dataSource[len - 1] = currentTemplate;this.setState({ isNewTemplate:!isNewTemplate,dataSource, currentRowSelection: currentTemplate['key']});
      }else{
        console.log('请先输入内容再新增');
      }
    }
  }

  // 删除 或取消模板
  cancelOrDeleteTemplate = () => {
    const { isNewTemplate } = this.state;
    if(!isNewTemplate) {
      // delete
      const { dataSource, currentRowSelection } = this.state;
      const KEY = 'key';
      let tarIndex = searchIndex(dataSource,KEY,currentRowSelection);
      this.props.deleteTemplate(dataSource[tarIndex]);
      /*
        展示代码
        
        
        dataSource.splice(tarIndex,1);
        console.log(dataSource.length);
        this.setState({dataSource, currentRowSelection:  dataSource.length  ? dataSource[0][KEY] : ''});
       */
    }else{
      // cancel
      const { dataSource } = this.state;
      const len = dataSource.length;
      dataSource.splice(len-1,1);
      // 这里暂时写死 - currentTemplate应该按dataSource中重写
      let newCurrentTemplate = {};
      Object.assign(newCurrentTemplate,dataSource[0]);
      for(let key in newCurrentTemplate){
        newCurrentTemplate[key] = 0;
      }
      this.setState({
        isNewTemplate:!isNewTemplate,
        dataSource,
        currentTemplate: newCurrentTemplate
      });
    }
  }

  // 移动 orient 1-向上 2-向下
  move = (orient) => {
    const { currentRowSelection, dataSource } = this.state;
    const { adjustOrder } = this.props;
    const KEY = 'key';
    let tarIndex = searchIndex(dataSource,KEY,currentRowSelection);
    // 将key 和 方向传出 做
    adjustOrder(tarIndex, orient);
  }

  // 选择模板 提交出父组件
  selectTeamplate = () => {
    const { currentRowSelection, dataSource } = this.state;
    const { getTemplate } = this.props;
    const KEY = 'key';
    let tarIndex = searchIndex(dataSource,KEY,currentRowSelection);
    // console.log(dataSource[tarIndex]);
    getTemplate(dataSource[tarIndex]);
  }


  render() {
    const { columns } = this.props;
    const { dataSource } = this.state;
    
    columns.map(v => {
      // 编号不做新增输入
      if(v.key !== 'index' && v.key !== 'key'){
        v.render = (text,_,index) => this.tableCellRender(text,index,v.dataIndex)
      }
      return v; 
    })
    
    const { isNewTemplate, currentRowSelection } = this.state;

    const rowSelection = {
      type: 'radio',
      onChange:this.handleRowSelection,
      selectedRowKeys:[currentRowSelection],
      getCheckboxProps: record => ({name: record.key}),
      hideDefaultSelections:true
    };
    return (
      <div style={{display: 'flex', padding: '20px'}}>
      {/* left */}
      <div style={{width: '600px'}}>
        <Table 
          dataSource={dataSource} 
          columns={columns}
          rowSelection={rowSelection}
          rowKey={record => (record.key)}
          pagination={false}
          size="middle"
        />
      </div>
      {/* right */}
      <div style={{width: '120px', padding: '0 0 0 15px', margin: 0}}>
        <Button disabled={isNewTemplate} onClick={() => this.move(1)}>向上移动</Button>
        <Button disabled={isNewTemplate} onClick={() => this.move(2)}>向下移动</Button>
        <br/>
        <br/>
        <Button onClick={this.newOrSaveTemplate}>{isNewTemplate ? (<span>保存模板</span>) : (<span>新增模板</span>) }</Button>
        <Button onClick={this.cancelOrDeleteTemplate}>{isNewTemplate ? (<span>取消新增</span>) : (<span>删除模板</span>) }</Button>
        <Button disabled={isNewTemplate} onClick={this.selectTeamplate}>选择模板</Button>
      </div>
    </div>
    )
  }
}
