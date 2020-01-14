import React,{ Component} from 'react';
import { Table, Input, Button } from 'antd';

/*============================ ==============================*/


// 按键名拿index
function searchIndex(arr,key,value) {
  console.log(arr);
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
 * {columns,dataSource,saveData()}  - from props
 *  - columns 中不写render 由本组件重写
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 是否新建模板
      isNewTemplate: false,
      // 当前编辑模板
      currentTemplate: {key:'', title: '', content: ''},
      // 当前选中行
      currentRowSelection: -1
    }  
  }

  componentDidMount() {
    // 将dataSource放入state，以便以后的操作
    const { dataSource } = this.props;
    this.setState({dataSource,currentRowSelection:dataSource[0].key})
  }

  componentDidUpdate(prevProps) { 
    if(prevProps.dataSource.length === 0){
      const { dataSource } = this.props;
      this.setState({dataSource,currentRowSelection:dataSource[0].key})
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

  // 新增 或 保存模板
  newOrSaveTemplate = () => {
    const { isNewTemplate, dataSource } = this.state;
    let len = dataSource.length;
    if(!isNewTemplate) {
      // 进入新增
      dataSource.splice(len,0,{key: dataSource[len-1].key + 1,title: '', content: ''});
      this.setState({isNewTemplate: !isNewTemplate,dataSource});
    }else{
      // 保存
      // 这里会有个bug 当table为空 新建的key如何创造
      const { currentTemplate } = this.state;
      if(currentTemplate.title && currentTemplate.content) {
        // 这里可能会跟服务器后重新
        currentTemplate['key'] = dataSource[len - 1]['key'] + 1;
        dataSource[len - 1] = currentTemplate;
        this.setState({isNewTemplate:!isNewTemplate,dataSource});
        // if(dataSource.length === 1) {
        //   this.setState({currentRowSelection: })
        // }
      }else{
        message.warning('请先输入内容再新增');
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
      dataSource.splice(tarIndex,1);
      this.setState({dataSource, currentRowSelection:  dataSource.length ? dataSource[0][KEY] : ''});
    }else{
      // cancel
      const { dataSource } = this.state;
      const len = dataSource.length;
      dataSource.splice(len-1,1);
      // 这里暂时写死
      this.setState({isNewTemplate:!isNewTemplate,dataSource,currentTemplate:{title:'',content:''}});
    }
  }

  // 移动 orient 1-向上 0-向下
  move = (orient) => {
    const { currentRowSelection, dataSource } = this.state;
    console.log(dataSource);
    const KEY = 'key';
    let tarIndex = searchIndex(dataSource,KEY,currentRowSelection);
    // 这里有个0 -- 当心
    if(tarIndex !== false) {
      if(orient){
        // 向上
        if(tarIndex != 0){
          this.setState({currentRowSelection: dataSource[tarIndex-1][KEY]});
        }else {
          console.warn('达到最上');
        }
      }else{
        // 向下
        if(tarIndex != dataSource.length-1){
          this.setState({currentRowSelection: dataSource[tarIndex+1][KEY]});
        }else{
          console.warn('达到最下');
        }
      }
    }else {
      console.error('数字出现了负数')
    }
  }


  render() {
    const { columns, dataSource } = this.props;

    columns.map(v => {
      // 编号不做新增输入
      if(v.key !== 'index'){
        v.render = (text,_,index) => this.tableCellRender(text,index,v.dataIndex)
      }
      return v; 
    })

    const { isNewTemplate, currentRowSelection } = this.state;
    
    const rowSelection = {
      selectedRowKeys:[currentRowSelection],
      getCheckboxProps: record => ({name: record.title}),
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
          rowKey={record => (record.key) }
          pagination={false}
          size="middle"
        />
      </div>
      {/* right */}
      <div style={{width: '120px', padding: '0 0 0 15px', margin: 0}}>
        <Button disabled={isNewTemplate} onClick={() => this.move(1)}>向上移动</Button>
        <Button disabled={isNewTemplate} onClick={() => this.move(0)}>向下移动</Button>
        <br/>
        <br/>
        <Button onClick={this.newOrSaveTemplate}>{isNewTemplate ? (<span>保存模板</span>) : (<span>新增模板</span>) }</Button>
        <Button onClick={this.cancelOrDeleteTemplate}>{isNewTemplate ? (<span>取消新增</span>) : (<span>删除模板</span>) }</Button>
      </div>
    </div>
    )
  }
}