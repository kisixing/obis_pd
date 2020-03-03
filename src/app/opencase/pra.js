import React,{ Component } from 'react';
import { Form, Iuput , Button } from 'antd';
// const FormItem = Form.Item;
class openCaseForm extends Component{
  render() {
    const { getFieldProps } = this.props.form;
    return (
      <Form
        inline

      >

      </Form>
    )
  }
}

const OpenCaseForm = Form.create()(openCaseForm);

export default function OpenCase() {
  return (<div>
    <OpenCaseForm/>
  </div>)
}