import React, { Component } from 'react';
import formRender from '../../render/form';



export default class Test extends Component{

  state = {
    test: '1',
    data:{
      test: '1'
    }
  }

  renderConfig = () => ({
    step: 1,
    rows:[
      {
        columns: [
          { 
            name: 'test[子结构]', 
            type: 'input', 
            valid: (value) => {
              let testNumber = new RegExp(/\d{6}/);
              console.log(value);
              return testNumber.test(value);
            }
          }
        ]
      }
    ]
  })

  renderConfig1 = () => ({
    step: 1,
    rows:[
      {
        columns: [
          { 
            name: 'test[后代非子结构]', 
            type: 'input', 
            valid: (value) => {
              let testNumber = new RegExp(/\d{6}/);
              console.log(value);
              return testNumber.test(value);
            }
          }
        ]
      }
    ]
  })


  handleFormChange = (_,{ name, value }) => {
    this.setState({test: value});
  }

  handleFormChange1 = (_,{ name, value }) => {
    // let obj = {};
    // Object.assign(obj, {test: value});
    // let { data } = this.state;
    // data.test = value;
    // this.setState({data: data});
    this.setState((prevState, props) => {
      prevState.data.test = value + 1;
      console.log(prevState);

      return { data: prevState.data}
    })
  }

  render() {
    const { data } = this.state;
    return (
      <div id='form-block' style={{backgroundColor: 'white'}}>
        {formRender(this.state, this.renderConfig(), this.handleFormChange)}
        {formRender(data, this.renderConfig1(), this.handleFormChange1)}
      </div>
    )
  }
}