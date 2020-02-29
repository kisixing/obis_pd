import * as baseData from "./data";
import valid from "../../render/common/valid";


const config = {
  /* ========================= formRender渲染UI config  ============================ */
  /*
  * 通用型
  * */
  // 主诉
  chief_complaint_config:() => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'chief_complaint[主诉]', type: 'textarea', valid: 'required',span: 16 },
          { name:'chief_complaintBtn[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zz')}
        ]
      },
    ]
  }),
  // 现病史
  medical_history_config: () => ({
    step : 3,
    rows:[
      {
        columns:[
          { name: 'medical_history[现病史]', type: 'textarea', valid: 'required', span: 16 },
          { name:'medical_history[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('xb')}
        ]
      }
    ]
  }),
  // 其他检查
  other_exam_config: () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'other_exam[其他]', type: 'textarea', valid: 'required', span: 16 },
          { name:'other_exam[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
        ]
      }
    ]
  }),
  // 诊断
  diagnosis_config: () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'diagnosis[诊断]', type: 'textarea', valid: 'required', span: 16 },
          { name:'diagnosisBtn[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd'), valid: 'required'}
        ]
      }
    ]
  }),
  // 处理
  treatment_config: () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'treatment[处理措施]', type: 'textarea', valid: 'required', span: 16 },
          { name:'treatment[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  }),
  // 预产期 - 胎儿+遗传
  pregnancy_history_config: () => ({
    step: 1,
    rows: [
      {
        columns: [
          { name: 'lmd[末次月经]', type: 'date', span: 12, valid: 'required'},
          { name: 'edd[预产期]', type: 'date', span: 12, valid: 'required'},
        ]
      },
      {
        columns: [
          { name: 'gravidity[G]', type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'parity[P]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'abortion[A]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
          { name: 'exfetation[E]',  type: 'select', span: 6, showSearch: true, options: baseData.ccOptions, valid: 'required'},
        ]
      },
    ]
  }),
  // 地贫/血型检查 - 胎儿+遗传
  wife_thalassemia: () => ({
    step: 1,
    rows: [
      {
        label: '女方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'hb(g/L)[Hb]', type: 'input', span: 6, showSearch: true},
          { name: 'mcv(fL)[MCV]',  type: 'input', span: 6, showSearch: true},
          { name: 'mch[MCH]',  type: 'input', span: 6, showSearch: true},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'hbA2[HbA2]', type: 'input', span: 6, showSearch: true,},
          { name: 'blood_group[血型]',  type: 'select', span: 6, showSearch: true, options: baseData.xuexingOptions},
          { name: 'genotype[地贫基因型]',  type: 'select', span: 11, showSearch: true, options: _genotypeAnemia }
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  }),
  husband_thalassemia : () => ({
    step: 1,
    rows: [
      {
        label: '男方:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 1 },
          { name: 'hb(g/L)[Hb]', type: 'input', span: 6, showSearch: true},
          { name: 'mcv(fL)[MCV]',  type: 'input', span: 6, showSearch: true},
          { name: 'mch[MCH]',  type: 'input', span: 6, showSearch: true},
        ]
      },
      {
        columns: [
          { span: 1 },
          { name: 'hbA2[HbA2]', type: 'input', span: 6, showSearch: true},
          { name: 'blood_group[血型]',  type: 'select', span: 6, showSearch: true, options: baseData.xuexingOptions},
          { name: 'genotype[地贫基因型]',  type: 'select', span: 11, showSearch: true, options: _genotypeAnemia }
        ]
      },
      {
        columns:[
          { span: 1 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  }),
  // 既往史 - 胎儿+遗传
  past_medical_history_config: () => ({
    step : 3,
    rows: [
      {
        columns:[
          { name: 'hypertension[高血压]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'diabetes_mellitus[糖尿病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'heart_disease[心脏病]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'other_disease[其他病史]', type: 'checkinput', valid: 'required', unselect: '无', radio: true, options: baseData.wssOptions,span:24 },
        ]
      },
      {
        columns:[
          { name: 'allergy[过敏史]', type: 'checkinput', valid: 'required', options: baseData.ywgmOptions, unselect: '无', span:24 },
        ]
      },
      {
        columns:[
          { name: 'blood_transfusion[输血史]', type: 'checkinput', valid: 'required', unselect: '无', options: baseData.sxsOptions, span: 24 },
        ]
      },
      {
        columns:[
          { name: 'operation_history[手术史]', type: 'table', pagination: false, editable: true, options: baseData.shoushushiColumns },
        ]
      },
    ]
  }),
  // 家族史 - 胎儿+遗传
  family_history_config : () => ({
    step : 3,
    rows:[
      {
        columns:[
          { span: 1 },
          {name:'hypertension[高血压]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
        ]
      },
      {
        columns:[
          { span: 1 },
          {name:'diabetes_mellitus[糖尿病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
        ]
      },
      {
        columns:[
          { span: 1 },
          {name:'congenital_malformation[先天畸形]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
        ]
      },
      {
        columns:[
          { span: 1 },
          {name:'heritable_disease[遗传病]', type:'checkinput-5',radio:true, valid: 'required', options: baseData.nhOptions,span: 15}
        ]
      }
    ]
  }),
  // 体格检查 - 胎儿 + 复诊
  physical_check_up_config : () => ({
    step : 3,
    rows:[
      {
        columns:[
          {
            name: 'bp(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: 8, valid: (value)=>{
              let message = '';
              if(value){
                // 缺少valid
                // message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();

              }else{
                message = valid('required',value)
              }
              return message;
            }
          },
          {
            name:'edema[浮@@@肿 ]', type:'select', span:8, showSearch: true, options: baseData.xzfOptions
          },
        ]
      },
      {
        columns:[
          {name:'fundal_height(cm)[宫@@@高 ]', type:'input', span:8, valid: 'required|number|rang(10,100)'},

          {name:'waist_hip(cm)[腹@@@围 ]', type:'input', span:8, valid: 'required|number|rang(0,100)'},
        ]
      },
      {
        columns:[
          {name:'pre_weight(kg)[孕前体重]', type:'input', span:6, valid: 'required|number|rang(10,100)'},

          {name:'current_weight(kg)[现 体 重 ]', type:'input', span:6, valid: 'required|number|rang(0,100)'},

          {name:'weight_gain(kg)[体重增长]',type:'input', span:6, valid: 'required|number|rang(0,100)'},
        ]
      }
    ]
  }),
  /*
  * 胎儿疾病部分
  * */
  // 唐氏筛查 - 未检查 按钮 安排在表单外处理
  early_downs_screen_config : () => ({
    step: 1,
    rows: [
      {
        label: '早期唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'hcg[β-HCG](mom)', type: 'input', span: 5 },
          { span: 1 },
          { name: 'papp[PAPP-A](mom)', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  }),
  middle_downs_screen_config : () => ({
    step: 1,
    rows: [
      {
        label: '中期唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      // {
      //   columns: [
      //     { span: 2 },
      //     { name: 'HCG[β-HCG](mom)', type: 'input', span: 5 },
      //     { span: 1 },
      //     { name: 'PAPP[PAPP-A](mom)', type: 'input', span: 5 },
      //   ]
      // },
      {
        columns: [
          { span: 2 },
          { name: 'ntd[NTD风险]', type: 'input', span: 5},
          { span: 1 },
          { name: 'hcg[β-HCG](mom)', type: 'input', span: 5 },
          { span: 1 },
          { name: 'afp[AFP](mom)', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  }),
  NIPT_downs_screen_config : () => ({
    step: 1,
    rows: [
      {
        label: 'NIPT唐氏筛查:', span: 12, className:'labelclass2'
      },
      {
        columns: [
          { span: 2 },
          { name: 'trisomy21[21三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy18[18三体风险]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'trisomy13[13三体风险]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'z21[21三体Z值]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'z18[18三体Z值]', type: 'input', span: 5 },
          { span: 1 },
          { name: 'z13[13三体Z值]', type: 'input', span: 5 },
        ]
      },
      {
        columns: [
          { span: 2 },
          { name: 'other_anomalies[其他异常]', type: 'input', span: 11 }
        ]
      }
    ]
  }),
  // 早孕超声（周） + 胎儿超声栏
  ultrasound_menopause_config : () => ({
    step: 1,
    rows: [
      {
        label: '早孕超声:', span: 12, className:'labelclass2'
      },
      {
        columns:[{ name: 'menopause(周)[停经]', type: 'input', span: 4 },]
      }
    ]
  }),
  ultrasound_fetus_config : () => ({
    step : 3,
    rows:[
      {
        columns:[
          { name: 'crl(mm)[CRL]', type: 'input', span: 7 },
          { name: 'crlweek(周)[如 孕]', type: 'input', span: 7 },
          {span:2},
          { name: 'nt(mm)[NT]', type: 'input', span: 7 },
        ]
      },
      {
        columns:[
          { name: 'excdesc[异常结果描述]', type: 'input', span: 8 },
        ]
      },
      {columns: [{label: '术前超声检查' , span: 12}]},

    ]
  }),
  // 中孕超声
  middle_config : () => ({
    step: 1,
    rows:[
      {
        columns:[
          { name: 'middle[中孕超声]', type: 'table', pagination: false, editable: true, options: baseData.BvColumns },
        ]
      },
    ]
  }),
  /*
  * 遗传病史部分
  * */
  // 染色体核型
  karyotype_config: () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'karyotype[诊断]', type: 'textarea', span: 16 },
          { name:'karyotype[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('zd')}
        ]
      }
    ]
  }),
  /*
  * 复诊部分
  * TODO 未确定变量
  * */
  // 复诊日期+孕周
  ckweekAndcreatdate: () => ({
    step: 1,
    rows: [
      {
        columns: [
          {name: 'createdate[复诊日期]', type: 'date', span: 6},
          {name: 'ckweek[孕周]', type: 'input', span: 6},
        ]
      }
    ]
  }),
  // 病情变化
  stateChange_config:() => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'stateChange[病情变化]', type: 'textarea', span: 16 },
          { name:'stateChange[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  }),
  // 前次检查结果
  lastResult_config: () => ({
    step: 1,
    rows: [
      {
        columns:[
          { name: 'lastResult[前次检查结果]', type: 'textarea', span: 16 },
          { name:'lastResult[]', type: 'buttons',span: 4, text: '(#1890ff)[模板]',onClick: () => this.openModal('cl')}
        ]
      },
    ]
  })
};

export default config;
