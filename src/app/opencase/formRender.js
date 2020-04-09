// 配置formRender，如需特殊交互请进行传参
import { validIDCard, validPhoneNumber, validAddress } from './validFn';
import { IDCardOptions, nationList, occupationOptions, numberOptions, hyOptions, isOption } from './data';
import cityOptions from '../../utils/cascader-address-options';
const formRenderConfig = {
  pregnancy_data_config: () => ({
    rows: [
      {
        columns: [
          { label: '孕妇信息', span: 12  }
        ]
      },{
        columns: [
          {name: 'usermcno[门诊号]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'zhunshengzheng[准生证号]', type: 'input', span: 6},
          {span: 3},
          {name: '[病例号]', type: 'input', valid: 'required', span: 6}
        ]
      },{
        columns: [
          {name: 'username[姓名]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'useridno[证件类型]', type: [{type: 'select',options: IDCardOptions, valid: 'required', span: 10},{type:'input', span: 14, valid: 'required', placeholder: '请输入证件号码'}], span: 8, valid: ['required',(value) => validIDCard(value,true)]},
          {span: 1},
          {name: 'userage[年龄]', type: 'input', span: 6, valid: 'required'},
        ]
      },{
        columns: [
          {name: 'usernation[国籍]', type: 'input', span: 6, valid: 'required'},
          {span: 1},
          {name: 'userroots[籍贯]', type: 'input', span: 6, valid: 'required'},
          {span: 3},
          {name: 'userpeople[民族]', type: 'select', span: 6,  options: nationList, showSearch: true, custom: true}
        ]
      },{
        columns: [
          {name: 'useroccupation[职业]', type: 'select', span: 6, options: occupationOptions},
          {span: 1},
          {
            name: 'usermobile[手机]', type: 'input', span: 6, valid: ["required", validPhoneNumber]
          }
        ]
      }
    ]
  }),
  husband_data_config:() => ({
    rows: [
      {
        columns: [
          { label: '丈夫信息', span: 12  }
        ]
      },{
        columns: [
          {name: 'userhmcno[门诊号]', type: 'input', span: 6},
        ]
      },{
        columns: [
          {name: 'userhname[姓名]', type: 'input', span: 6},
          {span: 1},
          {name: 'userhidno[证件类型]', type: [{type: 'select',options: IDCardOptions, span: 10, name: '0'},{type:'input', span: 14, name: '1', placeholder: '请输入证件号码'}], span: 8, valid: (value = {}) => validIDCard(value, false)},
          {span: 1},
          {name: 'userhage[年龄]', type: 'input', span: 6},
        ]
      },{
        columns: [
          {name: 'userhnation[国籍]', type: 'input', span: 6},
          {span: 1},
          {name: 'userhroots[籍贯]', type: 'input', span: 6},
          {span: 3},
          {name: 'userhpeople[民族]', type: 'select', span: 6, options: nationList, showSearch: true, custom: true,}
        ]
      },{
        columns: [
          {name: 'userhoccupation[职业]', type: 'select', span: 6, options: occupationOptions},
          {span: 1},
          {name: 'userhmobile[手机]', type: 'input', span: 6, valid: validPhoneNumber},
          {span: 3},
          {name: 'userhconstant[户口属地]', type: 'input', span:6}
        ]
      },
    ]
  }),
  other_data_config:() => ({
    step: 1,
    rows: [
      {
        columns: [
          {label: '其他信息', span: 12}
        ]
      },{
        columns: [
          {
            name: 'useraddress[居住地址]', type: [{type: 'cascader', options: cityOptions, span: 6},{type:'input', vaild: 'required', span: 15}], span: 24, valid: ['required',validAddress]
          }
        ]
      },{
        columns: [
          {
            name: 'userconstant[户口地址]', type: [{type: 'cascader', options: cityOptions,  span: 6},{type:'input', valid: 'required', span: 15}],span: 24, valid: ['required',validAddress]
          }
        ]
      }
    ]
  }),
  benyun_data_config: () => ({
    step: 1,
    rows: [
      {
        columns: [
          {label: '孕产史信息', span: 12},
        ]
      },
      {
        columns: [
          {name: 'marry[婚姻状态]', type: 'select', span: 6, options: hyOptions, valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'yunc[孕次]', value: 0, type: 'select', span: 6, options: numberOptions,  valid: 'required'},
          {span: 1},
          {name: 'chanc[产次]', value: 0, type: 'select', span: 6, options: numberOptions,  valid: 'required'},
        ]
      },
      {
        columns: [
          {name: 'gesmoc[末次月经]', type: 'date', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'gesexpect[预产期]', type: 'date', span: 6,  valid: 'required'},
          {span: 1},
          // TODO
          {name: '[多胎]', type: [{type: 'select',options: isOption, valid: 'required', span: 8},{type:'input', span: 16, valid: 'required', placeholder: '多胎请输入多胎号'}], span: 6, valid: ['required',(value) => {
            if("0" in value){
              if(value['0'].value === "是"){
                if('1' in value && value['1']){
                  return ""
                }else{
                  return "*请输入多胎号";
                }
              }
            }
            return "*请选择是否为多胎";
          }]}
        ]
      },
      {
        columns: [
          {name: 'cktizh[孕前体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'ckcurtizh[现体重](kg)', type: 'input', span: 6,  valid: 'required'},
          {span: 1},
          {name: 'cksheng[身高](cm)', type: 'input', span: 6,  valid: 'required'},
        ]
      }
    ]
  })
}

export default formRenderConfig;