import {
  characterOptions0,
  characterOptions1,
  characterOptions2,
  characterOptions7,
  incisionTypeOptions,
  isOptions,
  wbOptions,
  operation_itemsOptions,
  operationLevelOptions,
  puncturePositionOptions0,
  puncturePositionOptions1,
  puncturePositionOptions2,
  puncturePositionOptions7,
  sjTreeOptions,
  rmSjTreeOptions,
  statusOptions,
  yesOptions,
  hnOptions,
  preoperativeUltrasonographyColumns0,
  preoperativeUltrasonographyColumns1,
  preoperativeUltrasonographyColumns2,
  preoperativeUltrasonographyColumns3,
  preoperativeUltrasonographyColumns4,
  preoperativeUltrasonographyColumns5,
  preoperativeUltrasonographyColumns6,
  preoperativeUltrasonographyColumns7,
  instrumentOptions1,
  instrumentOptions5,
  bleedFlowColumns,
  hemogramColumns, measurementColumns,
  anesthesiaMethodOptions,
  isPharacyOptions,
  bloodBankOptions,
  ward_operation_itemsOptions
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
        {span: 1},
        {name: 'operationName[手术名称]', type: 'select', valid: 'required', options: operation_itemsOptions, span: SPAN_6},
        {name: 'operationLevel[手术级别]', type: 'select', valid: 'required', options: operationLevelOptions, span: SPAN_6},
        {name: 'incisionType[切口类别]', type: 'select', valid: 'required',options: incisionTypeOptions, span: SPAN_6},
        {span: 5}
      ]
    },
    {
      columns: [
        {span: 1},
        {name: 'rePuncture[是否再次穿刺]', type: 'checkinput-5',valid: 'required', radio: true, options: isOptions, span: SPAN_18 },
        {span: 5}
      ]
    }
  ]
});
const surgery_config = (templateFn) => ({
  step: 1,
  rows: [
    {
      columns: [
        {span: 1},
        afterFhr
      ]
    },
    {columns: [
      {span: 1},
      doctors_advice,
      {name: `typeBtn[]`, type: 'buttons', span: 4, text: '(#1890ff)[模板]', onClick: () => templateFn('or3')}
    ]}
  ]
})

// 术前记录
const operation_date = {name: 'operation_date[手术日期]', type: 'date', span: SPAN_6};
const temperature = {name: 'temperature(℃)[体温 ]', type: 'input', span: SPAN_6};
const bP = {name: 'bp(mmHg)[血压 ]', type: ['input(/)','input'], span: SPAN_6, valid: (value)=>{
  let message = '';
  if(value){
    message = [0,1].map(i=>valid(`number|required|rang(0,${[139,109][i]})`,value[i])).filter(i=>i).join();
  }else{}
  return message;
}};
// 手术操作
/*
* 胎盘出血/脐带出血/宫璧出血/是否用药 2种特殊的输入框
* */
const operation_no = {name: 'operation_no[手术编号]', type: 'input', span: SPAN_6};
const operator = {name: 'operator[术者]', type: 'input', span: SPAN_6};
const assistant = {name: 'assistant[助手]', type: 'input', span: SPAN_6};
const start_time = {name: 'start_time[开始时间]', type: 'time', placeholder: "", format: "HH:mm", span: SPAN_6};
const end_time = {name: 'end_time[结束时间]', type: 'time', placeholder: "", format: "HH:mm",span: SPAN_6};
const duration = {name: 'duration[持续时间](min)', type: 'input', span: SPAN_6};
const timesOfNeedleInsertion = {name: 'timesOfNeedleInsertion[进针次数]', type: 'input', span: SPAN_6};
const placenta = {name: 'placenta[经否胎盘]', type: 'select',options: [{label: '经',value: '经'},{label: '否',value: '否'}], span: SPAN_6};
const placentaHemorrhage = {name: 'placentaHemorrhage[胎盘出血]', type: 'hemorrhageselect', span: SPAN_6};
const uterineWallHemorrhage = {name: 'uterineWallHemorrhage[宫壁出血]', type: 'hemorrhageselect',options: yesOptions, span: SPAN_6};
const inspectionItems = {name: 'inspectionItems[送检项目]', type: 'cascader', radio: false,options: sjTreeOptions,span: SPAN_6};
const amniotic_fluid = {name: 'amniotic_fluid[羊水量](ml)', type: 'input', span: SPAN_6};
const isPharmacy = {name: 'isPharmacy[是否用药]', type: 'checkinput', radio: true, options: isPharacyOptions, span: SPAN_18}
const process_evaluation = {name: 'process_evaluation[过程评估]', type: 'checkinput', radio:true, options:statusOptions, span: SPAN_20};
const diagnosis = {name: 'diagnosis[诊断]', type: 'textarea', span: SPAN_18};
const special_case = {name: 'special_case[特殊记录]', type: 'textarea', span: SPAN_18};
const negativePressure = {name: 'negativePressure[负压](ml)', type: 'input', span: SPAN_6};
const villusVolume = {name: 'villusVolume[绒毛量](支)', type: 'input', span:SPAN_6};
const numberOfHits = {name: 'numberOfHits[刺中次数]', type: 'input', span: SPAN_6};
const omphalorrhagia = {name: 'omphalorrhagia[脐带出血]', type: 'hemorrhageselect', options: yesOptions, span: SPAN_6};
const cordBloodVolume = {name: 'cordBloodVolume[脐血量](ml)', type: 'input', span: SPAN_6};
const punctureCount = {name: 'punctureCount[穿刺次数]', type: 'input', span: SPAN_6};
// 术后情况
const afterFhr = {name: 'afterFhr[术后胎心率](bpm)', type: 'input', span: SPAN_6};
const doctors_advice = {name: 'doctors_advice[医后叮嘱]', type: 'textarea', span: SPAN_18};
const afterAfv = {name: 'afterafv[术后AFV](mm)', type: 'input', span: SPAN_6};
const retainFhr = {name: 'retainfhr[保留胎胎心率](bpm)', type: 'input', span: SPAN_6};
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
      {columns: [
        {span: 1},
        operation_date,
        temperature,
        bP,
        {span: 5}
      ]},
      {
        columns: [
          { span: 1},
          { name: 'preoperativeUltrasonography[术前超声检查]', type: 'table',span: 18,  pagination: false, editable: true, options: preoperativeUltrasonographyColumns0 },
          { span: 5}
        ]
      }
    ]
  }),
  // 手术操作
  // 传入fn，打开模板输入
  operative_procedure_config:(templateFn) => ({
    step: 1,
    rows: [
      {
        columns: [
          {span: 1},
          operation_no,
          operator
        ]
      },
      {
        columns: [
          {span: 1},
          start_time,
          end_time,
          duration
        ]
      },
      {
        columns: [
          {span: 1},
          {name: 'puncturePosition[穿刺部位]', type: 'select', showSearch: true, options: puncturePositionOptions0, span: SPAN_6},
          timesOfNeedleInsertion
        ]
      },
      {
        columns: [
          {span: 1},
          placenta,
          placentaHemorrhage,
          uterineWallHemorrhage
        ]
      },
      {
        columns: [
          {span: 1},
          inspectionItems,amniotic_fluid,{name: 'character[性状]', type: 'select',options: characterOptions0, span: SPAN_6}]},
      {
        columns: [
          {span: 1},
          isPharmacy
        ]
      },
      {
        columns: [
          {span: 1},
          process_evaluation
        ]
      },
      {
        columns: [
          {span: 1},
          diagnosis
        ]
      },
      {
        columns: [
          {span: 1},
          special_case,
          {name: `typeBtn[]`, type: 'buttons', span: 4, text: '(#1890ff)[模板]', onClick: () => templateFn('or2')}
      ]}
    ]
  }),
  // 术后情况
  surgery_config
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
      {columns: [{span:1}, operation_date,temperature,bP]},
      {columns: [{span:1}, { name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns1, span: 20 },]}
    ]
  }),
  // 手术操作
  operative_procedure_config: () => ({
    step: 1,
    rows: [
      {
        columns: [{span:1}, operation_no, operator]},
      {
        columns: [{span:1}, start_time, end_time, duration]},
      {
        columns: [
          {span:1}, 
          {name: 'puncturePosition[穿刺部位]', type: 'select', options: puncturePositionOptions1 ,span: SPAN_6},
          {name: 'instrument[器械]', type: 'select', options: instrumentOptions1, span: SPAN_6}
        ]
      },
      {
        columns: [
          {span:1}, 
          {name: 'intubationFrequency[插管次术]', type: 'input',span: SPAN_6},
          {name:'aspirationTimes[抽吸次数]', type: 'input', span: SPAN_6},
          negativePressure
        ]
      },
      {
        columns: [
          {span:1}, 
          {name: 'inspectionItems[送检项目]', type: 'cascader', options: rmSjTreeOptions, span: SPAN_6},
          villusVolume,
          {name: 'character[性状]', type: 'select',options: characterOptions1, span: SPAN_6}
        ]
      },
      {
        columns: [{span:1}, isPharmacy]},
      {
        columns: [{span:1}, {name: 'whetherBleeding[是否出血]', type: 'checkinput', radio: true, options: wbOptions, span: SPAN_18}]
      },
      {
        columns: [{span:1}, process_evaluation]
      },
      {
        columns: [{span:1}, diagnosis]
      },
      {
        columns: [{span:1}, special_case]
      }
    ]
  }),
  // 术后
  surgery_config
};
/*
 * 脐带穿刺
 */
const config2 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config:() => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_date, temperature, bP]},
      {columns: [{span:1}, { name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns2, span: SPAN_20 },]}
    ]
  }),
  // 手术操作
  operative_procedure_config:() => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {columns: [{span:1}, start_time, end_time, duration]},
      {columns: [
        {span:1}, 
        {name: 'puncturePosition[穿刺部位]', type: 'select', showSearch: true, options: puncturePositionOptions2, span: SPAN_6},
        timesOfNeedleInsertion,
        numberOfHits
      ]},
      {columns: [{span:1}, placenta, placentaHemorrhage,omphalorrhagia]},
      {columns: [{span:1}, uterineWallHemorrhage]},
      {columns:
          [
            {span:1}, 
            inspectionItems, cordBloodVolume,
            {name: 'character[性状]', type: 'select',options: characterOptions2, span: SPAN_6}
      ]},
      {columns:[{span:1}, isPharmacy]},
      {columns:[{span:1}, process_evaluation]},
      {columns:[{span:1}, diagnosis]},
      {columns:[{span:1}, special_case]}
    ]
  }),
  // 术后情况
  surgery_config
};
/*
* 羊膜腔灌注
* */
const config3 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config:() => ({
    step: 1,
    rows: [
      {columns:[{span:1}, operation_date, temperature, bP]},
      {columns: [
        {span:1}, 
        { name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns3, span: SPAN_20 },
      ]}
    ]
  }),
  operative_procedure_config:() => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {columns: [{span:1}, start_time, end_time, duration]},
      {columns: [
        {span:1}, 
        // 此处的 穿刺部位/羊水性状 与config0 - 羊膜腔穿刺 相同
        {name: 'puncturePosition[穿刺部位]', type: 'select', showSearch: true, options: puncturePositionOptions0,span: SPAN_6},
        punctureCount,
        {name: 'perfusionVolume[灌注液量](ml)', type: 'input', span: SPAN_6}
      ]},
      {columns: [
        {span:1}, 
        placenta,placentaHemorrhage,
        {name: 'character[羊水性状]', type: 'select',options: characterOptions0, span: SPAN_6}
      ]},
      {columns: [{span:1}, isPharmacy]},
      {columns: [{span:1}, process_evaluation]},
      {columns: [{span:1}, diagnosis]},
      {columns: [{span:1}, special_case]}
    ]
  }),
  surgery_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, afterFhr]},
      {columns: [{span:1}, afterAfv]},
      {columns: [{span:1}, doctors_advice]}
    ]
  })
}
/*
* 选择减胎
* */
const config4 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_date, temperature, bP]},
      {columns: [
        {span:1}, 
        {name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns4, span: SPAN_18 },
      ]}
    ]
  }),
  // 手术操作
  operative_procedure_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {columns: [{span:1}, start_time, end_time, duration]},
      {columns: [
        // TODO 这里的options应该需要动态设置
        // {name: 'embryReductionTarget[减胎对象]', type: 'select', options: [{value: '胎儿1', label: '胎儿1'}], span: SPAN_6},
        {span:1}, 
        punctureCount,
        
      ]},
      {
        columns: [
          {span:1}, 
          {name: 'returnLiquid[回抽液体]', type: 'select', options: hnOptions, span: SPAN_6},
          {name: 'character[液体性状]', type: 'select', options: characterOptions0, span: SPAN_6},
        ]
      },
      // {columns: [{span:1}, isPharmacy]},
      {
        columns: [
          {label: '10%氯化钠用量', span: SPAN_24}
        ]
      },
      {
        columns: [
          {span: 1},
          {name: '[首量](ml)', type: 'input', span: SPAN_6},
          {name: '[追加](ml)', type: 'input', span: SPAN_6},
          // TODO 估计要相加
          {name: '[总量](ml)', type: 'input', span: SPAN_6},
        ]
      },
      {columns: [{span: 1}, {name: 'vanishingTimeOfFetalHeart[胎心消失时间](min)', type: 'input', span: SPAN_6 }]},
      {columns: [{span:1}, process_evaluation]},
      {columns: [{span:1}, diagnosis]},
      {columns: [{span:1}, special_case]}
    ]
  }),
  // 术后情况
  surgery_config:() => ({
    step: 1,
    rows: [
      {columns:[{span:1}, retainFhr]},
      {columns:[{span:1}, doctors_advice]}
    ]
  })
}
/*
* 羊水减量
* */
const config5 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_date, temperature, bP]},
      {
        columns: [
          {span:1}, 
          {name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns5, span: SPAN_18 },
        ]
      }
    ]
  }),
  // 手术操作
  operative_procedure_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {columns: [{span:1}, start_time, end_time, duration]},
      {
        columns: [
          // TODO 动态添加options
          {span:1}, 
          {name: 'punctureObject[穿刺对象]', type: 'select', options:[{value: '胎儿1', label: '胎儿1'}], span: SPAN_6},
          punctureCount,
          {name: 'instrument[穿刺针]', type: 'select', options: instrumentOptions5, span: SPAN_6}
        ]
      },
      {columns: [{span:1}, placenta,placentaHemorrhage]},
      {
        columns: [
          {span:1}, 
          {name: 'drawSheepWater[抽吸羊水量](ml)', type: 'input', span: SPAN_6},
          {name: 'character[羊水性状]', type: 'select',options: characterOptions0 , span: SPAN_6},
          negativePressure
        ]
      },
      {columns: [{span:1}, isPharmacy]},
      {columns: [{span:1}, process_evaluation]},
      {columns: [{span:1}, diagnosis]},
      {columns: [{span:1}, special_case]}
    ]
  }),
  // 术后情况
  surgery_config:() => ({
    step: 1,
    rows: [
      {columns: [{span:1}, afterFhr]},
      {columns: [{span:1}, afterAfv]},
      {columns: [{span:1}, doctors_advice]},
    ]
  })
};
/*
* 宫内输血
* */    
const config6 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_date, temperature, bP]},
      {columns :[
        {span:1}, 
        {name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns6, span: SPAN_20 },
      ]},
      {columns:[
        {span:1}, 
        {name: 'bleedIndex[术前血流指标]', type: 'table', valid: 'required', pagination: false, editable: false, buttons: false, options: bleedFlowColumns, span: SPAN_20},
      ]},
      {columns:[
        {span:1}, 
        {name: 'bloodBank[库血情况]', type: 'select', valid: 'required', options: bloodBankOptions, span: SPAN_6 },
        {name: 'collectBloodDate[采血日期]', type: 'date', valid: 'required', span: SPAN_6}
      ]},
      {columns:[
        {span:1}, 
        {name: 'hemogram[术前血象检查]', type: 'table', valid: 'required', pagination: false, editable: false, buttons: false, options: hemogramColumns, span: SPAN_20},
      ]},
    ]
  }),
  // 手术操作
  operative_procedure_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {
        columns: [
          {span: 1},
          {name: '[宫内输血第](次)', type: 'input', span: SPAN_6, valid: "number"},
          {
            name: '[胎儿麻醉药](mg)', 
            type: [
              {type: 'select', options: [{label:'罗库溴胺',value:'罗库溴胺'}], span: 12},
              {type: 'input', span: 12, placeholder: "请输入用药量"},
            ],
            span: SPAN_6
          }
        ]
      },
      {columns: [
        {span:1}, 
        {name: 'start_time[输血开始时间]', type: 'time', span: SPAN_6},
        {name: 'end_time[输血结束时间]', type: 'time', span: SPAN_6},
        {name: 'duration[输血持续时间]', type: 'input', span: SPAN_6},
      ]},
      {
        columns: [
          {span:1}, 
          {name: 'targetHct[目标HCT]', type: 'input', span: SPAN_6},
          {name: 'calculationOfBloodTransfusionVolume[计算输血量](ml)', type: 'input', span: SPAN_6},
          {name: 'actualTransfusionVolume[实际输血量](ml)', type: 'input', span: SPAN_6},
        ]
      },
      {
        columns: [
          {span:1}, 
          {name: 'transfusionSpeed[输血速度](ml/min)', type: 'input', span: SPAN_6}
        ]
      },
      {
        columns: [
          {span:1}, 
          {name: 'puncturePosition[穿刺部位]', type: 'select', options: puncturePositionOptions2, span: SPAN_6},
          {name: 'instrument[器械]', type: 'select', options: instrumentOptions1, span: SPAN_6},
        ]
      },
      {columns: [{span:1}, timesOfNeedleInsertion, numberOfHits]},
      {columns: [{span:1}, placenta, placentaHemorrhage, omphalorrhagia]},
      {columns: [{span:1}, uterineWallHemorrhage]},
      {columns: [{span:1}, inspectionItems, cordBloodVolume,
          {name: 'character[性状]', type: 'select', options: characterOptions2, span: SPAN_6}
      ]},
      {columns: [{span:1}, isPharmacy]},
      {columns: [{span:1}, process_evaluation]},
      {columns: [{span:1}, diagnosis]},
      {columns: [{span:1}, special_case]},
    ]
  }),
  // 术后情况
  surgery_config:() => ({
    step: 1,
    rows:[
      {columns: [{span:1}, afterFhr]},
      // 这两个值需要前端整合已有值
      {columns: [{span:1}, {name:'bleedIndex[术后血流指标]', type: 'table', editable: true, pagination: false, buttons: false, options: bleedFlowColumns, span: SPAN_18}]},
      {columns: [{span:1}, {name:'hemogram[术后血象检查]', type: 'table', editable: true, pagination: false ,buttons: false, options: hemogramColumns, span: SPAN_18}]},
      {columns: [{span:1}, doctors_advice]}
    ]
  })
};
/*
 * 胸腔积液|腹水|囊液穿刺
 */
const config7 = {
  // 手术项目
  operationItem_config,
  // 术前记录
  preoperative_record_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_date, temperature, bP]},
      // TODO 未定
      {columns :[
        {span:1}, 
        {name: 'preoperativeUltrasonography[术前超声检查]', type: 'table', valid: 'required', pagination: false, editable: true, options: preoperativeUltrasonographyColumns7, span: SPAN_20 },
      ]},
      {columns :[
        {span:1}, 
        {name: 'measurement[术前测量值]', type: 'table', valid: 'required', pagination: false, editable: false, buttons: false, options: measurementColumns, span: SPAN_20 },
      ]},
    ]
  }),
  // 手术操作
  operative_procedure_config: () => ({
    step: 1,
    rows: [
      {columns: [{span:1}, operation_no, operator]},
      {columns: [{span:1}, start_time, end_time, duration]},
      {
        columns: [
          {span:1}, 
          {name: 'puncturePosition[穿刺部位]', type: 'select', options: puncturePositionOptions7,span: SPAN_6},
          punctureCount
        ]
      },
      {columns: [{span:1}, placenta, placentaHemorrhage]},
      {
        columns: [
          {span:1}, 
          {name: 'liquidVolume[液体量](ml)', type: 'input', span: SPAN_6},
          {name: 'character[性状]', type: 'select', options: characterOptions7, span: SPAN_6},
        ]
      },
      {columns: [{span:1}, isPharmacy]},
      {columns: [{span:1}, process_evaluation]},
      {columns: [{span:1}, diagnosis]},
      {columns: [{span:1}, special_case]},
    ]
  }),
  // 术后情况
  surgery_config:() => ({
    step: 1,
    rows: [
      {columns:[{span:1}, afterFhr]},
      {
        columns: [
          {span:1}, 
          {name: 'measurement[术后测量值]', type: 'table', pagination: false, editable: true, buttons: false, options: measurementColumns, span: SPAN_20 }
        ]
      },
      {columns:[{span:1}, doctors_advice]},
    ]
  })
};


/*
* 病房病历 与上面模板不相同，
* */
const ward_config = (templateFn) => ({
  step: 1,
  rows:[
    {
      columns: [
        {name: 'userName[患者姓名]', type: 'input', valid: 'required', span: SPAN_6},
        {name: 'dept[科室]', type: 'input', valid: 'required', span: SPAN_6},
        {name: 'inpatientNo[住院号]', type: 'input', valid: 'required', span: SPAN_6},
        {name: 'bedNo[床号]', type: 'input', valid: 'required', span: SPAN_6},
      ]
    },
    {
      columns: [
        {name: 'operationNameWard[手术名称]', type: 'checkinput', valid: 'required', options: ward_operation_itemsOptions,span: SPAN_24},
      ]
    },
    {
      columns: [
        {name: 'operationLevelWard[手术级别]', type: 'select', valid: 'required',options:operationLevelOptions , span: SPAN_6},
        {name: 'incisionTypeWard[切口类别]', type: 'select', valid: 'required', options: incisionTypeOptions ,span: SPAN_6},
      ]
    },
    {
      columns:[
        {name: 'preoperativeDiagnosis[术前诊断]', type: 'textarea', valid: 'required', span: SPAN_18}
      ]
    },
    {
      columns:[
        {name: 'intraoperativeDiagnosis[术中诊断]', type: 'textarea', valid: 'required', span: SPAN_18}
      ]
    },
    {
      columns:[
        {name: 'operationDate[手术日期]', type: 'date', valid: 'required', span: SPAN_6},
        {name: 'startTime[开始时间]', type: 'time', valid: 'required', format: "HH:mm" ,span: SPAN_6},
        {name: 'endTime[结束时间]', type: 'time', valid: 'required', format: "HH:mm", span: SPAN_6}
      ]
    },
    {
      columns:[
        {name: 'operationNo[手术编号]', type: 'input', valid: 'required', span: SPAN_6},
        {name: 'operator[术者]', type: 'input', valid: 'required' ,span: SPAN_6},
        // {name: 'assistant[助手]', type: 'input', valid: 'required', format: "HH:mm", span: SPAN_6}
      ]
    },
    {
      columns:[
        {name: 'anesthesiaMethod[麻醉方法]', type: 'select', valid: 'required', options: anesthesiaMethodOptions , span: SPAN_6},
        {name: 'anesthesiologist[麻醉医师]', type: 'input', valid: 'required' ,span: SPAN_6},
        {name: 'instrumentNurse[器械护士]', type: 'input', valid: 'required', span: SPAN_6}
      ]
    },
    {
      columns:[
        {name: 'operationProcedure[手术经过]', type: 'textarea', valid: 'required', span: SPAN_18},
        {name: `typeBtn[]`, type: 'buttons', span: 4, text: '(#1890ff)[模板]', onClick: () => templateFn('or6')}
      ]
    }
  ]
});

const formRenderConfig = {
  config0,
  config1,
  config2,
  config3,
  config4,
  config5,
  config6,
  config7,
  ward_config
};
export default formRenderConfig;
