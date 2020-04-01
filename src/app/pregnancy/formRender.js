import { sfzOptions, nationList } from './data';
const formRenderConfig = {
  gravidaInfo_config: () => ({
    step: 1,
    rows: [
      {
        columns: [
          { name: 'userage[年龄]', type: 'input', span: 5, valid: 'required|number'},
          { span: 1 },
          { name: 'userbirth[出生日期]', type: 'date', span: 5,valid: 'required'},
          { span: 1 },
          { name: 'usercuzh[建档日期]', type: 'date', span: 5 ,valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'usernation[国籍]', type: 'input', span: 5 ,valid: 'required'},
          { span: 1 },
          { name: 'userroots[籍贯]', type: 'input', span: 5 ,valid: 'required'},
          { span: 1 },
          { name: 'userpeople[民族]', type: 'select', span: 5 ,options: nationList, showSearch: true, custom: true, valid: 'required'},
          { span: 1 },
          { name: 'useroccupation[职业]', type: 'input', span: 5 },
        ]
      }, {
        columns: [
          { name: 'usermobile[手机]', type: 'input', span: 5, valid: 'required|number' },
          { span: 1 },
          { name: 'useridtype[证件类型]', type: 'select', span: 5, showSearch: false, options: sfzOptions ,valid: 'required'},
          { span: 1 },
          { name: 'useridno[证件号码]', type: 'input', span: 5 ,valid: 'required'}
        ]
      }, {
        columns: [
          { name: 'userconstant[户口地址]', type: 'input', span: 11,valid: 'required'},
          { span: 1 },
          { name: 'useraddress[居住地址]', type: 'input', span: 11,valid: 'required'},
          { span: 1 },
        ]
      },
    ]
  }),
  husbandInfo_config: () => ({
    step: 1,
    rows: [
      {
        columns: [
          { name: 'userhname[丈夫姓名]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'userhage[年龄]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'userhmcno[门诊号]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [           
          { name: 'userhnation[国籍]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'userhroots[籍贯]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'userhpeople[民族]', type: 'select', span: 5 ,options: nationList, showSearch: true, custom: true },
          { span: 1 },
          { name: 'userhoccupation[职业]', type: 'input', span:  5, }
        ]
      },
      {
        columns: [
          { name: 'userhmobile[手机]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'add_FIELD_husband_useridtype[证件类型]', type: 'select', span: 5, options: sfzOptions },
          { span: 1 },
          { name: 'userhidno[证件号]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'userhconstant[户口属地]', type: 'input', span: 5 }
        ]
      }
    ]
  })
}

export default formRenderConfig;