import {
  characterOptions0, characterOptions1,
  incisionTypeOptions,
  nhOptions, wbOptions,
  operation_itemsOptions,
  operationLevelOptions,
  puncturePositionOptions0, puncturePositionOptions1,
  sjTreeOption, statusOptions, yesOptions,
  preoperativeUltrasonographyColumns0, preoperativeUltrasonographyColumns1,
  instrumentOptions1
} from "./data";
import valid from "../../render/common/valid";

const SPAN_6 = 6, SPAN_8 = 8, SPAN_18 = 18, SPAN_20 = 20, SPAN_24 = 24;

// '羊膜腔穿刺','绒毛活检','脐带穿刺','羊膜腔灌注','选择性减胎','羊水减量','宫内输血','胸腔积液|腹水|囊液穿刺'
/*
* 通用
* */
// 手术项目
const operationItem_config = () => ({
  step: 1,
  rows: [
    {
      columns: [
        {name: 'operationName[手术名称]', type: 'select', options: operation_itemsOptions, span: 6},
        {name: 'operationLevel[手术级别]', type: 'select', options: operationLevelOptions, span: 6},
        {name: 'incisionType[切口类型]', type: 'select', options: incisionTypeOptions, span: 6}
      ]
    },
    {
      columns: [
        {name: 'rePuncture[是否再次穿刺]', type: 'checkinput-5', radio: true, options: nhOptions }
      ]
    }
  ]
});
// 术前记录
const operation_date = {name: 'operation_date[手术日期]', type: 'date', span: SPAN_6};
const temperature = {name: 'temperature(℃)[体@@@温 ]', type: 'input', span: SPAN_6};
const bP = {name: 'bP(mmHg)[血@@@压 ]', type: ['input(/)','input'], span: SPAN_8, valid: (value)=>{
  let message = '';
  if(value){
    message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
  }else{}
  return message;
}};
// 手术操作
const operation_no = {name: 'operation_no[手术编号]', type: 'input', span: SPAN_6};
const operator = {name: 'operator[手术编号]', type: 'input', span: SPAN_6};
const assistant = {name: 'assistant[手术编号]', type: 'input', span: SPAN_6};
const start_time = {name: 'start_time[开始时间]', type: 'time', placeholder: "", format: "HH:mm", span: SPAN_6};
const end_time = {name: 'end_time[结束时间]', type: 'time', placeholder: "", format: "HH:mm",span: SPAN_6};
const duration = {name: 'duration[持续时间](min)', type: 'input', span: SPAN_6};
const timesOfNeedleInsertion = {name: 'timesOfNeedleInsertion[进针次术]', type: 'input', span: SPAN_6};
const placenta = {name: 'placenta[经否胎盘]', type: 'select',options: [{label: '经',value: '经'},{label: '否',value: '否'}], span: SPAN_6};
const placentaHemorrhage = {name: 'placentaHemorrhage[胎盘出血]', type: 'select', options: yesOptions, span: SPAN_6};
const uterineWallHemorrhage = {name: 'uterineWallHemorrhage[宫壁出血]', type: 'select',options: yesOptions, span: SPAN_6};
const inspectionItems = {name: 'inspectionItems[送检项目]', type: 'treeselect', options: sjTreeOption,span: SPAN_6};
const amniotic_fluid = {name: 'amniotic_fluid[羊水量](min)', type: 'input', span: SPAN_6};

const isPharmacy = {name: 'isPharmacy[是否用药](若选择有，请填写药物与用量)', type: 'checkinput', radio: true, options: nhOptions, span: SPAN_18}
const process_evaluation = {name: 'process_evaluation[过程评估]', type: 'checkinput', radio:true, options:statusOptions, span: SPAN_20};
const diagnosis = {name: 'diagnosis[诊断]', type: 'textarea', span: SPAN_24};
const special_case = {name: 'special_case[特殊记录]', type: 'textarea', span: SPAN_24};

const negativePressure = {name: 'negativePressure[负压](ml)', type: 'input'};
const villusVolume = {name: 'villusVolume[绒毛量]', type: 'input'};
// 术后情况
const afterFhr = {name: 'afterFhr[术后胎心率](bpm)', type: 'input', span: SPAN_24};
const doctors_advice = {name: 'doctors_advice[医后叮嘱]', type: 'textarea', span: SPAN_24};
/*
* 羊膜腔穿刺 tempalteId:0
* */
const config0 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config:() => ({
    step: 1,
    rows: [
      {columns: [operation_date,temperature,bP]},
      {columns: [{ name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns0, span: 20 },]}
    ]
  }),
  // 手术操作
  operative_procedure_config:() => ({
    step: 1,
    rows: [
      {columns: [operation_no,operator, assistant]},
      {columns: [start_time, end_time, duration]},
      {columns: [{name: 'puncturePosition', type: 'select', options: puncturePositionOptions0},timesOfNeedleInsertion]},
      {columns: [placenta,placentaHemorrhage,uterineWallHemorrhage]},
      {columns: [inspectionItems,amniotic_fluid,{name: 'character[性状]', type: 'select',options: characterOptions0, span: SPAN_6}]},
      {columns:[{label: '之后完善药物/用量输入框'}]},
      {columns: [isPharmacy]},
      {columns: [process_evaluation]},
      {columns: [diagnosis]},
      {columns: [special_case]}
    ]
  }),
  // 术后情况
  surgery_config:() => ({
    step: 1,
    rows: [
      {columns: [afterFhr]},
      {columns: [doctors_advice]}
    ]
  })
};
/*
* 绒毛活检
* */
const config1 = {
  operationItem_config,
  // 术前记录
  preoperative_record_config: () => ({
    step: 1,
    rows: [
      {columns: [operation_date,temperature,bP]},
      // TODO 未完成
      {columns: [{ name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns1, span: 20 },]}
    ]
  }),
  operative_procedure_config: () => ({
    step: 1,
    row: [
      {columns: [operation_no, operator, assistant]},
      {columns: [start_time, end_time, duration]},
      {columns: [
        {name: 'puncturePositionOptions1[穿刺部位]', type: 'select', options: puncturePositionOptions1},
        {name: 'instrumentOption[器械]', type: 'select', options: instrumentOptions1}]},
      {columns: [
          {name: 'intubationFrequency[插管次术]', type: 'input',span: SPAN_6},
          {name:'aspirationTimes[抽吸次数]', type: 'input', span: SPAN_6}
          ,negativePressure
        ]
      },
      {columns: [inspectionItems, villusVolume,
          {name: 'character[性状]', type: 'select',options: characterOptions1, span: SPAN_6}
          ]
      },
      {columns: [isPharmacy]},
      {columns: [{name: 'whetherBleeding[是否出血]', type: 'checkinput', radio: true, options: wbOptions, span: SPAN_18}]}
      {columns: [process_evaluation]},
      {column: [diagnosis]},
      {column: [special_case]}
    ]
  })
};