import * as util from './util';


// function toOptions(data, vfn = ()=>({})){
// 	if(data instanceof Array){
// 		return data.map((v,i) => ({ label: v, value: v, ...vfn(v,i) }))
// 	}
// 	if(data && typeof data === 'object'){
// 		return Object.keys(data).map(i => ({ label: data[i], value: i, ...vfn(v,i) }))
// 	}
// 	return [];
// }

/**
 * 如果不想在value里面使用label的数据，可以换成用index作为value
 */
function toOptions(data, vfn = () => ({})) {
  if (data instanceof Array) {
    return data.map((v, i) => {
      const { k, ...rest } = v;
      return { ...rest, label: k || v, value: k || v, ...vfn(k || v, i) }
    })
  }
  if (data && typeof data === 'object') {
    return Object.keys(data).map((v, i) => ({ label: data[v], value: v, ...vfn(data[v], v, i) }))
  }
  if (typeof data === 'string') {
    return data.split(/[,;]/).map((v, i) => ({ label: v, value: v, ...vfn(v, i) }))
  }
  return [];
}

/**
 * 表单初始数据
 */
// export const formEntity = {
// 	"id": "",
// 	"userid": "6",
// 	"doctor": "",
// 	"checkdate": new Date().toLocaleDateString().replace(/\//g,'-'),
// 	"ckweek": '',
// 	"cktizh": "",
// 	"ckshrinkpressure": "",
// 	"ckdiastolicpressure": "",
// 	"ckzijzhz": "",
// 	"ckgongg": "",
// 	"tx1": "",
// 	"xl1": "1",
// 	"tx2": "",
// 	"xl2": "1",
// 	"tx3": "",
// 	"xl3": "1",
// 	"cktaix": "",
// 	"ckxianl": "1",
// 	"ckfuzh": "1",
// 	"fpg": "",
// 	"pbg2h": "",
// 	"hbAlc": "",
// 	"riMoMedicine": "",
// 	"riMoDosage": "",
// 	"riNoMedicine": "",
// 	"riNoDosage": "",
// 	"riEvMedicine": "",
// 	"riEvDosage": "",
// 	"riSlMedicine": "",
// 	"riSlDosage": "",
// 	"upState": "",
// 	"upDosage24h": "",
// 	"": "4,周",
// 	"heartRate": "",
// 	"examination": "",
// 	"tetz1": "",
// 	"teafv1": "",
// 	"teqxl1": "",
// 	"tetz2": "",
// 	"teafv2": "",
// 	"teqxl2": "",
// 	"tetz3": "",
// 	"teafv3": "",
// 	"teqxl3": "",
// 	"ckzijzhzqt": "",
// 	"treatment": "",
// 	"ckappointment": "2019-12-15",
// 	"rvisitOsType": "产科普通门诊",
// 	"ckappointmentArea": "1"
// };

/**
 * 本次产检记录表单初始数据
 */
export const formEntity = {
  "parseAddFieldLocations": null,
  "saveInitialData": false,
  "checkdate": new Date().toLocaleDateString().replace(/\//g, '-'),
  "ckdia": "",
  "ckappointment": "",
  "ckappointmentArea": "",
  "ckweek": "",
  "ckmove": "",
  "cksheng": "",
  "cktizh": "",
  "ckshrinkpressure": "",
  "ckdiastolicpressure": "",
  "ckmaibo": "",
  "ckgongg": "",
  "ckfuw": "",
  "cktaix": "",
  "cktaiw": "",
  "ckxianl": "",
  "ckxianj": "",
  "ckfuzh": "",
  "ckxuess": "",
  "ckniaodb": "",
  "ckxuet": "",
  "ckzijzhz": "",
  "ckzijzhzqt": "",
  "ckchul": "",
  "ckjianchyy": "",
  "sign": "",
  "ckresult": "",
  "doctor": "",
  "rvisitOsType": "",
  "treatment": "",
  "fpg": "",
  "pbg2h": "",
  "riMoMedicine": "",
  "riMoDosage": "",
  "riNoMedicine": "",
  "riNoDosage": "",
  "riEvMedicine": "",
  "riEvDosage": "",
  "riSlMedicine": "",
  "riSlDosage": "",
  "hbAlc": "",
  "upState": "",
  "upDosage24h": "",
  "heartRate": "",
  "examination": "",
  "medicationPlan": [{}],
  "fetalCondition": [{}, {}],
  "fetalUltrasound": [{}, {}],
  "fetal": "",
  "tx1": "",
  "xl1": "",
  "tetz1": "",
  "teafv1": "",
  "teqxl1": "",
  "location1": "",
  "tx2": "",
  "xl2": "",
  "tetz2": "",
  "teafv2": "",
  "teqxl2": "",
  "location2": "",
  "tetz3": "",
  "teafv3": "",
  "teqxl3": "",
  "txlt": "",
  "xllt": "",
  "txrt": "",
  "xlrt": "",
  "txlb": "",
  "xllb": "",
  "txrb": "",
  "xlrb": "",
  "arrear": "",
  "addField": ""
};

/**
 * 入院登记表单初始数据
 */
export const regFormEntity = {
  "hzxm": '007',
  "xb": '男',
  "csrq": '1947-07-07',
  "lxdh": "10086",
  "zyks": '',
  "rysq": '',
  "tsbz": "",
  "sfzwyzy": "",
  "gj": "",
  "jg": "",
  "mz": "",
  "csd1": "",
  "csd2": "",
  "hy": "",
  "xzz": "",
  "yb1": "",
  "sfzdz": "",
  "yb2": "",
  "sfzhm": "",
  "ly": "",
  "zy": "",
  "gzdwjdz": "",
  "dwyb": "",
  "dwlxdh": "",
  "lxrxm": "",
  "lxrdh": "",
  "lxrdz": "",
  "gx": "",
};

/**
 * 表格当表头
 */
export const tableKey = () => [
  {
    title: '日期',
    key: 'checkdate',
    type: 'date',
    width: '180',
    format: i => (`${i || ''}`).replace(/\d{4}-/, '')
  },
  {
    title: '孕周',
    key: 'ckweek',
    type: 'input'
  },
  {
    title: '体重',
    key: 'cktizh',
    children: [
      {
        title: '(kg)',
        key: 'cktizh',
        type: 'input'
      },
    ]
  },
  {
    title: '血压',
    key: 'ckdiastolicpressure',
    width: 160,
    children: [
      {
        title: '(mmHg)',
        key: 'ckdiastolicpressure',
        type: 'input'
      },
    ]
  },
  {
    title: '自觉症状',
    key: 'ckzijzhz',
    type: 'input'
  },
  {
    title: '胎心',
    key: 'cktaix',
    width: 130,
    children: [
      {
        title: '(bpm)',
        key: 'cktaix',
        type: 'input'
      },
    ]
  },
  {
    title: '先露',
    key: 'ckxianl',
    type: 'select',
    options: xlOptions
  },
  {
    title: '宫高',
    key: 'ckgongg',
    children: [
      {
        title: '(cm)',
        key: 'ckgongg',
        type: 'input'
      },
    ]
  },
  {
    title: '下肢水肿',
    key: 'ckfuzh',
    type: 'select',
    options: ckfuzhOptions
  },
  {
    title: '其他',
    key: 'ckzijzhzqt',
    type: 'input'
  },
  {
    title: '下次复诊',
    key: 'ckappointment',
    children: [
      {
        title: '预约日期',
        key: 'ckappointment',
        type: 'date'
      }
    ]
  },
  {
    title: '处理措施',
    key: 'treatment',
    type: 'input',
    width: 150
  }
];

/**
 * 诊疗计划表头
 */
export const planKey = () => [
  {
    title: 'No',
    key: 'index',
    format: (v, { row }) => row + 1
  },
  {
    title: '时间',
    key: 'time',
  },
  {
    title: '孕周',
    key: 'gestation',
  },
  {
    title: '产检项目',
    key: 'item',
  },
  {
    title: '提醒事项',
    key: 'event',
  }
].map(i => ({ type: 'input', ...i }));

/**
 * 管理诊疗组表头
 */
export const managePlanKey = () => [
  {
    title: '编号',
    key: 'id',
  },
  {
    title: '诊疗计划组',
    key: 'item',
  },
  {
    title: '内容',
    key: 'content',
  }
].map(i => ({ type: 'input', ...i }));

/**
 * 新建诊疗组表头
 */
export const newPlanKey = () => [
  {
    title: '编号',
    key: 'id',
  },
  {
    title: '孕周',
    key: 'time',
  },
  {
    title: '提醒事件',
    key: 'event',
  }
].map(i => ({ type: 'input', ...i }));

/**
 * 诊断输入框的联想数据，当没有输入的时候显示top为true的数据
 */
export const diagnosis = toOptions('瘢痕子宫,妊娠期糖尿病,妊娠高血压,双胎妊娠,子宫平滑肌瘤'.split(','), v => ({ top: true })).concat(toOptions(['高血压', '冠心病', '多胎妊娠', '梅毒']));

/**
 * 先露
 */
export const xlOptions = [
  { label: '头', value: '1' },
  { label: '臀', value: '2' },
  { label: '肩', value: '3' },
  { label: '/', value: '4' },
];

/**
 * 位置
 */
export const wzOptions = [
  { label: '左', value: '1' },
  { label: '上', value: '2' },
  { label: '右下', value: '3' },
  { label: '左下', value: '4' },
];

/**
 * 浮肿
 */
export const ckfuzhOptions = [
  { label: '-', value: '1' },
  { label: '+', value: '2' },
  { label: '++', value: '3' },
  { label: '+++', value: '4' },
  { label: '++++', value: '5' },
];

/**
 * 浮肿
 */
export const yyfaOptions = [
  { label: '一天一次', value: '1' },
  { label: '一天两次', value: '2' },
  { label: '一天三次', value: '3' },
  { label: '一天四次', value: '4' },
  { label: '每四小时一次', value: '5' },
  { label: '每六小时一次', value: '6' },
  { label: '每八小时一次', value: '7' },
  { label: '每晚一次', value: '8' },
];

/**
 * 胎动好,无腹痛,无阴道流血
 */
export const ckzijzhzOptions = toOptions(['胎动好', '无腹痛', '无阴道流血']);

/**
 * 下次复诊 几周后
 */
export const nextRvisitWeekOptions = [
  { label: '', value: '' },
  { label: '1周后', value: '1,周' },
  { label: '2周后', value: '2,周' },
  { label: '4周后', value: '4,周' },
];

/**
 * 门诊
 */
export const rvisitOsTypeOptions = toOptions(['', '普通门诊', '高危门诊', '入院'], (v, i) => ({
  value: i,
  describe: v.slice(0, 1)
}));

/**
 * 上午/下午
 */
export const ckappointmentAreaOptions = [
  { label: '上午', describe: '上', value: '1' },
  { label: '下午', describe: '下', value: '2' },
];
/**
 * 产检项目
 */
export const cjOptions = [
  { label: '胎监', value: '1' },
  { label: '尿蛋白', value: '2' },
];
/**
 * 胎监选项
 */
export const tjOptions = [
  { label: '有反应', value: '1' },
  { label: '可疑，复查', value: '2' },
  { label: '异常，入院治疗', value: '3' },
];

// 住院登记表
/**
 * 住院科室
 */
export const zyksOptions = toOptions(['孕妇区', '产区', '爱婴区', '产科VIP']);
/**
 * 是否在我院住院
 */
export const sfzyOptions = toOptions([{ k: '是(shouzhenyy-原住院号)', addspan: 2 }, '否']);
/**
 * 出生地
 */
export const csd1Options = toOptions(['广东', '福建', '北京']);
export const csd2Options = toOptions(['广州', '深圳', '上海']);
/**
 * 婚姻
 */
export const hyOptions = toOptions('未婚,已婚,丧偶,离婚');
/**
 * 来源
 */
export const lyOptions = toOptions('本区,本市,本省,外省,港澳台,外国');
/**
 * 职业
 */
export const zyOptions = toOptions('国家公务员,专业技术人员,企业管理人员,自由职业者,工人,现役军人,个体经营者,职员,农民,学生,退(离)休人员,无业人员(婴儿或学龄的儿童),其他');
/**
 * 联系人与患者关系
 */
export const gxOptions = toOptions('配偶,子,女,孙子、孙女或外孙子女,父母,祖父母或外祖父母,兄弟姐妹,家庭内其他关系,非家庭关系成员');

/**
 * 初潮
 */
export const ccOptions = toOptions('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');

export const wjjOptions = toOptions('未检查');


/**
 * 手术项目
 *  2020-02-06 根据新模型修改
 */
export const operation_itemsOptions = toOptions('羊膜腔穿刺术,绒毛活检术,脐带穿刺术,羊膜腔灌注术,选择性减胎术,羊水减量,宫内输血,胎儿胸腔积液,腹水,囊液穿刺');
export const ward_operation_itemsOptions = toOptions('羊膜腔穿刺术,绒毛活检术,脐带穿刺术,羊膜腔灌注术,选择性减胎术,羊水减量,宫内输血,胎儿胸腔积液、腹水、囊液穿刺');

/**
 * 身份证：证件类型
 */
export const sfzOptions = [{ label: '身份证', value: '身份证' },
{ label: '护照', value: '护照' },
{ label: '回乡证', value: '回乡证' },
{ label: '台胞证', value: '台胞证' }];

/**
 * 证件类型
 */
export const zjlxOptions = toOptions('身份证,护照,回乡证,台胞证');

/**
 * 酒的类型
 */
export const jiuOptions = toOptions('没有,白酒,啤酒,红酒,其他');

/**
 * 受孕方式
 */
export const syfsOptions = toOptions('IVF{#FF3300}');

/**
 * 血型O,A,B,AB
 */
export const xuexingOptions = [{ label: 'O', value: 'O' },
{ label: 'A', value: 'A' },
{ label: 'B', value: 'B' },
{ label: 'AB', value: 'AB' }];
//toOptions('O,A,B,AB');

/**
 * 血型RH(+),RH(-)
 */
export const xuexing2Options = [{ label: 'RH(+)', value: 'RH(+)' },
{ label: 'RH(-)', value: 'RH(-)' }];
//toOptions('RH(+),RH(-)');

/**
 * 一般症状
 */
export const ybzzOptions = toOptions('头晕{#FF3300},头痛{#FF3300},呕吐{#FF3300},胸闷{#FF3300},肚痛{#FF3300},腰酸{#FF3300},流血{#FF3300},白带增多{#FF3300},便秘{#FF3300},抽筋{#FF3300},浮肿{#FF3300},其他{#FF3300}');

/**
 * 疾病
 */
export const jibOptions = toOptions('高血压{#FF3300},心脏病{#FF3300},癫痫{#FF3300},甲亢{#FF3300},甲减{#FF3300},糖尿病{#FF3300},肾脏疾病{#FF3300},风湿{#FF3300},肝脏疾病{#FF3300},肺结核{#FF3300},血栓疾病{#FF3300},地中海贫血{#FF3300},G6PD缺乏症{#FF3300},其他');

/**
 * 宫颈涂片
 */
export const gjtpOptions = toOptions('正常,异常,未有检查,不清楚');

/**
 * 血制品
 */
export const xzpOptions = toOptions([{
  k: '红细胞{#FF3300}(shouzhenyy-时间,医院,原因)',
  addspan: 2
}, { k: '血小板{#FF3300}(shouzhenyy-时间,医院,原因)', addspan: 2 }, {
  k: '血浆{#FF3300}(shouzhenyy-时间,医院,原因)',
  addspan: 2
}, { k: '全血{#FF3300}(shouzhenyy2-时间,医院,原因)', addspan: 2 }, {
  k: '白蛋白{#FF3300}(shouzhenyy2-时间,医院,原因)',
  addspan: 2
}, { k: '免疫球蛋白{#FF3300}(shouzhenyy2-时间,医院,原因)', addspan: 2 }, '其他{#FF3300}', '不清楚']);
export const sxsOptions = toOptions([{ k: '有{#FF3300}(shouzhenyy-时间,原因)', addspan: 2 }]);

/**
 * 数量
 */
export const slOptions = toOptions('多,中,少');

/**
 * 不孕病史 shouzhenyy-x这个是当前模块的编辑组件
 */
export const bybsOptions = toOptions('输卵管因素{#FF3300},丈夫少精弱精畸精{#FF3300},PCO{#FF3300}（多囊卵巢）,原因不明{#FF3300}'.split(',').map(i => `${i}(shouzhenyy-发现时间&date,治疗&input)`).concat(['其他{#FF3300}(input)', '不清楚{#FF3300}(input)']));

/**
 * 频率
 */
export const plOptions = toOptions('无,偶尔,经常');

/**
 * 婚姻史
 */
export const hysOptions = toOptions('未婚,已婚,离异,再婚,丧偶');

/**
 * 是否
 */
export const yesOptions = toOptions('是,否');

/**
 * 近亲
 */
export const jinqOptions = toOptions('是{#FF3300},否');

/**
 *皮肤黏膜
 */
export const pfOptions = toOptions('正常,苍白{#FF3300},皮下出血{#FF3300}(input),其他{#FF3300}(input)');

/**
 *正常、异常
 */
export const neOptions = toOptions('正常,异常(input){#FF3300}');

/**
 *正常、其他
 */
export const noOptions = toOptions('正常,其他(input){#FF3300}');

/**
 *清、其他
 */
export const coOptions = toOptions('清,其他(input){#FF3300}');

/**
 *存在、其他
 */
export const slfsOptions = toOptions('存在,其他(input){#FF3300}');

/**
 *无、其他
 */
export const blfsOptions = toOptions('无,其他(input){#FF3300}');
/**
 *无、其他
 */
export const eoOptions = toOptions('无,其他(input){#FF3300}');

/**
 *正常、畸形
 */
export const jxOptions = toOptions('正常,畸形{#FF3300}');

/**
 * 是 否
 */
export const isOptions = toOptions('是(input){#FF3300},否')

/**
 *无、有
 */
export const hnOptions = toOptions('无,有');
/**
 *有、无
 */
export const nhOptions = toOptions('有(input){#FF3300},无');

export const isPharacyOptions = toOptions('有(pharacyinput),无');

export const wssOptions = toOptions([{ k: '有{#FF3300}(input)', addspan: 2 }]);

/**
 * 是否用药 （含有用药特殊输入框）
 */
export const iumOption = toOptions('有(右)(input),无');



/**
 * 是否出血 （含特殊输入框）
 */
export const wbOptions = toOptions('有(whetherbleedingselect),无');

/**
 *乳头
 */
export const rtOptions = toOptions('凸起,凹陷');

/**
 *肾区叩痛
 */
export const sktOptions = toOptions('无,有（左）{#FF3300},有（右）{#FF3300}');

/**
 *下肢浮肿
 */
export const xzfOptions = toOptions('-,+,+-,++,+++');

/**
 *双膝反射
 */
export const sxfOptions = toOptions('存在,亢起{#FF3300},消失{#FF3300},引不起{#FF3300}');

/**
 *乙肝两对半
 */
export const ygOptions = toOptions('正常,小三阳{#FF3300},大三阳{#FF3300},慢活肝{#FF3300},未查{#FF3300},其他{#FF3300}(input)');

/**
 *阴阳未查
 */
export const yywOptions = toOptions('阴性,阳性{#FF3300}(input),未查{#FF3300}');

/**
 *阴阳未查、其他
 */
export const yyw2Options = toOptions('阴性,阳性{#FF3300},未查{#FF3300},其他{#FF3300}(input)');

/**
 *梅毒
 */
export const mdOptions = toOptions(['阴性', {
  k: '阳性{#FF3300}(shouzhenyy1-TPPA滴度,TRUST滴度)',
  addspan: 4
}, '未查{#FF3300}', '其他{#FF3300}(input)']);

/**
 *OGTT
 */
export const ogttOptions = toOptions(['正常', {
  k: 'GDM{#FF3300}(shouzhenyy-空腹血糖,餐后1H血糖,餐后2H血糖)',
  addspan: 4
}, '未查{#FF3300}']);

/**
 *地贫
 */
export const dpOptions = toOptions('正常,甲型{#FF3300}(input),乙型{#FF3300}(input),未查{#FF3300},其他{#FF3300}(input)');

/**
 *尿蛋白
 */
export const dbnOptions = toOptions('阴性,弱阳性{#FF3300},阳性{#FF3300}(input),未查{#FF3300},其他{#FF3300}(input)');

/**
 *药物或食物过敏史
 */
export const ywgmOptions = toOptions('药物{#FF3300}(input),食物{#FF3300}(input),其他{#FF3300}(input)');

/**
 *个人史
 */
export const grsOptions = toOptions(['吸烟{#FF3300}(input)[支/天]', '饮酒{#FF3300}(input)[ml/天]', '接触有害物质{#FF3300}(input)', '接触放射线{#FF3300}(input)', {
  k: '服用药物{#FF3300}(input-诊断&用药&剂量&备注)',
  addspan: 2
}, '其他{#FF3300}(input)']);

/**
 *叶酸
 */
export const ysOptions = toOptions('孕前服用,孕期服用');
/**
 *家族史
 */
export const jzsOptions = toOptions('多胎{#FF3300},死胎/死产{#FF3300},先天畸形{#FF3300},精神病{#FF3300},痴呆{#FF3300},先天智力低下{#FF3300},肿瘤{#FF3300},心脏病{#FF3300},高血压{#FF3300},糖尿病{#FF3300},其他{#FF3300}(input)');

/**
 *遗传病
 */
export const ychOptions = toOptions('先天畸形{#FF3300},先天性聋哑{#FF3300},先天智力低下{#FF3300},先天心脏病{#FF3300},G6PD缺乏症{#FF3300},地中海贫血{#FF3300},血友病{#FF3300},白化病{#FF3300},原发高血压{#FF3300},糖尿病{#FF3300},肿瘤{#FF3300},其他{#FF3300}(input)');

/**
 *尿蛋白
 */
export const xOptions = toOptions('阴性,弱阳性{#FF3300},阳性{#FF3300},未查{#FF3300},其他{#FF3300}(input)');

/**
 * 手术史表头
 */
export const shoushushiColumns = [
  {
    title: '手术名称',
    key: 'name',
    type: 'input'
  },
  {
    title: '手术日期',
    key: 'date',
    type: 'date',
    mode: "ym"
  },
  {
    title: '手术医院',
    key: 'hospital',
    type: 'input'
  },
  {
    title: '术后病理',
    key: 'postoperativePathology',
    type: 'input'
  },
]

/**
 * 中孕b超
 */
export const BvColumns = [
  {
    title: '孕周',
    key: 'gesweek',
    type: 'input'
  },
  {
    title: 'BPD',
    key: 'date',
    type: 'input',
  },
  {
    title: 'HC',
    key: 'hospital',
    type: 'input'
  },
  {
    title: 'AC',
    key: 'postoperativePathology',
    type: 'input'
  },
  {
    title: 'FL',
    key: 'fl',
    type: 'input'
  },
  {
    title: 'AFV',
    key: 'afv',
    type: 'input'
  },
  {
    title: '脐血流',
    key: 'qxl',
    type: 'input'
  },
  {
    title: '其他异常描述',
    key: 'otherexception',
    type: 'input'
  },
]

/**
 * 孕产史表头
 */
export const pregnanciesColumns = [
  {
    title: '孕次',
    key: 'index',
    width: '50',
    format: (v, { row }) => row + 1
  },
  {
    title: '   年-月    ',
    key: 'datagridYearMonth',
    type: 'date',
    width: '160',
    mode: "ym",
  },
  {
    title: '流产',
    children: [
      {
        title: '自然',
        key: 'zir',
        type: 'input'
      },
      {
        title: '清宫',
        key: 'removalUterus',
        type: 'checkbox',
        holdeditor: true
      },
      {
        title: '人工',
        key: 'reng',
        type: 'input'
      }
    ]
  },
  {
    title: '引产',
    key: 'yinch',
    type: 'input'
  },
  {
    title: '死胎',
    key: 'sit',
    type: 'checkbox',
    holdeditor: true
  },
  {
    title: '早产',
    key: 'zaoch',
    type: 'input'
  },
  {
    title: '足月产',
    key: 'zuych',
    type: 'input'
  },
  {
    title: '分娩方式',
    children: [
      {
        title: '顺产',
        key: 'shunch',
        type: 'checkbox',
        holdeditor: true
      },
      {
        title: '手术产式',
        key: 'shouShuChanType',
        type: 'input'
      }
    ]
  },
  {
    title: '产后情况',
    children: [
      {
        title: '出血',
        key: 'chuxue',
        type: 'checkbox',
        holdeditor: true
      },
      {
        title: '产褥热',
        key: 'chanrure',
        type: 'checkbox',
        holdeditor: true
      }
    ]
  },
  {
    title: '并发症',
    key: 'bingfzh',
    type: 'input',
    width: '200',
  },
  {
    title: '小孩情况',
    children: [
      {
        title: '性别',
        key: 'xingb',
        type: 'select',
        showSearch: true,
        options: [
          { label: '男', value: '1' },
          { label: '女', value: '2' },
          { label: '未知', value: '3' },
        ],
      },
      {
        title: '生存',
        key: 'child',
        type: 'select',
        showSearch: true,
        options: [
          { label: '健在', value: '1' },
          { label: '死亡', value: '2' },
          { label: '未知', value: '3' },
        ],
      },
      {
        title: '死亡时间',
        key: 'siw',
        type: 'input'
      },
      {
        title: '死亡原因',
        key: 'deathCause',
        type: 'input'
      },
      {
        title: '后遗症',
        key: 'sequela',
        type: 'input'
      },
      {
        title: '出生体重(kg)',
        key: 'tizh',
        type: 'input'
      }
    ]
  },
  {
    title: '分娩医院',
    key: 'hospital',
    type: 'input'
  },
  {
    title: '备注',
    key: 'hospital',
    type: 'input'
  }
]


export const lisiColumns = [
  {
    title: '编号',
    key: 'no',
  },
  {
    title: '修改时间',
    key: 'date',
  },
  {
    title: '修改人',
    key: 'by',
  },
  {
    title: '修改字段',
    key: 'field',
  }
]

/**
 * 术者
 */
export const operaterOptions = [{ label: '张志', value: '张志' }, { label: '王军', value: '王军' }];

/**
 * 身份证：证件类型
 */
export const assistantOptions = [{ label: '李志', value: '李志' }, { label: '李君', value: '李君' }];
/**
 *叶酸
 */
export const statusOptions = toOptions('顺利,困难,失败');
export const instrumentOptions = toOptions('穿刺针,活检钳,双腔穿刺镜');
export const characterOptions = toOptions('淡黄色,水样,血染,新鲜血性,陈旧血性');
export const methodOptions = toOptions('经胎盘,经羊膜');
export const uterusOptions = toOptions('前位,后位');
export const placentaOptions = toOptions('前上壁,前下壁,后上壁,后下壁,左前壁,右前壁,左后壁,右后壁,左侧壁,右侧壁,子宫底,峡部');

/**
 * 手术级别
 */
export const operationLevelOptions = toOptions('一级,二级,三级,四级');

/**
 * 切口类型
 */
export const incisionTypeOptions = toOptions('0Ⅰ,0Ⅱ,0Ⅲ,Ⅰ,Ⅱ,Ⅲ,Ⅳ');

/**
 * 羊膜腔穿刺
 */
// 超声检查
export const preoperativeUltrasonographyColumns0 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  // { title: '脐静脉直径(mm)', key: 'umbilicalVeins', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' },
];
// 穿刺部位
export const puncturePositionOptions0 = toOptions('经胎盘,经羊膜');
// 形状
export const characterOptions0 = toOptions('淡黄色,水样,血染,新鲜血性,陈旧血性');

/**
 * 绒毛活检 -
 */
// 超声检查
export const preoperativeUltrasonographyColumns1 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'CRL(mm)', key: 'crl', type: 'input' },
  { title: '孕囊大小(cm&sup2)', key: 'cellNatureSize', type: 'input' },
  { title: '胎心搏动(bpm)', key: 'fhb', type: 'input' },
  { title: '孕囊与宫璧分离部位', key: 'gsUwSeparationPart', type: 'input' },
  { title: '分离部分面积(cm&sup2)', key: 'gsUwSeparationSize', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
]
// 穿刺部位
export const puncturePositionOptions1 = toOptions('经宫颈,经腹部');
// 器械
export const instrumentOptions1 = toOptions('穿刺针16/18G,穿刺针17/19G,穿刺针20G,穿刺针21G,活检钳');
// 形状
export const characterOptions1 = toOptions('典型,不典型');

/*
* 脐带穿刺
* */
// 超声
export const preoperativeUltrasonographyColumns2 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '脐静脉直径(mm)', key: 'umbilicalVeins', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' },
];
// 穿刺
export const puncturePositionOptions2 = toOptions('脐静脉,脐带游离段');
// 形状
export const characterOptions2 = toOptions('鲜红,混入羊水,混入母血');

/*
* 羊膜腔灌注
* */
export const preoperativeUltrasonographyColumns3 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: 'NT(mm)', key: 'nt', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '其他项目', key: 'otherProject', type: 'input' }
];

/*
* 选择性减胎术
* */
export const preoperativeUltrasonographyColumns4 = [
  { title: '绒毛膜性质', key: 'chorionicity', type: 'input' },
  { title: '胎儿位置', key: 'fetusPosition', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: 'NT(mm)', key: 'nt', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' }
];

/*
* 羊水减量
* */
export const preoperativeUltrasonographyColumns5 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: 'NT(mm)', key: 'nt', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '其他项目', key: 'otherProject', type: 'input' }
];
// 穿刺针
// TODO 不知道键名是不是器械
export const instrumentOptions5 = toOptions('16/18G,17/19G,20G,21G');

/*
* 宫内输血
* */
// 术前超声检查
export const preoperativeUltrasonographyColumns6 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: 'AC(mm)', key: 'ac', type: 'input' },
  { title: '胎重(g)', key: 'fetalWeight', type: 'input' },
  { title: 'H/C', key: 'hc', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '脐静脉直径(mm)', key: 'umbilicalVeins', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' },
];

// 术后血流指标
export const bleedFlowColumns = [
  { title: '日期', key: 'checkDate', type: 'input' },
  {
    title: 'UA', key: 'UA', children: [
      { title: 'EDF', key: 'edf', type: 'input' },
      { title: 'PI', key: 'piUa', type: 'input' },
      { title: 'RI', key: 'riUa', type: 'input' },
      { title: 'S/D', key: 'sdua', type: 'input' },
    ]
  },
  { title: 'DV', key: 'dv', type: 'input' },
  {
    title: 'MCA', key: 'MCA', children: [
      { title: 'PSV', key: 'psv', type: 'input' },
      { title: 'PI', key: 'piMca', type: 'input' },
      { title: 'RI', key: 'riMca', type: 'input' },
      { title: 'S/D', key: 'sdmca', type: 'input' },
    ]
  }
];

// 血象检查
export const hemogramColumns = [
  // {title: ' ', key: 'checkDate', type: 'input'},
  { title: 'WBC(x10⁹/L)', key: 'wbc', type: 'input' },
  { title: `RBC(x10&sup1&sup2/L)`, key: 'rbc', type: 'input' },
  { title: 'HGB(g/L)', key: 'hgb', type: 'input' },
  { title: 'HCT', key: 'hct', type: 'input' },
  { title: 'PLT(x10⁹ /L)', key: 'reticulocyte', type: 'input' },
  { title: '红织网(%)', key: 'nucleatedrbc', type: 'input' },
  { title: '有核红(x10⁹ /L)', key: 'bilirubin', type: 'input' },
  { title: 'coomb\'s', key: 'coomb', type: 'input' },
];

/*
* 胸腔积液、腹水、囊液抽吸
* */
export const preoperativeUltrasonographyColumns7 = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' },
];
// 穿刺部位
export const puncturePositionOptions7 = toOptions('胸腔,腹腔膜');
// 性状
export const characterOptions7 = toOptions('清亮，金黄色,血型，浅黄色,浑浊');

// 术后测量值
export const measurementColumns = [
  { title: '左胸腔积液(mm)', key: 'lefteffusion', type: 'input' },
  { title: '右胸腔积液(mm)', key: 'righteffusion', type: 'input' },
  { title: '腹水(mm)', key: 'ascites', type: 'input' },
  { title: '囊肿(mm)', key: 'cyst', type: 'input' },
  { title: '肺压缩', key: 'pneumoniacompression', type: 'input' },
  { title: '心和纵隔', key: 'heartmediastinum', type: 'input' }
];

/**
 * 术前超声检查
 */

export const preoperativeUltrasonographyColumns = [
  { title: '胎儿', key: 'fetus', type: 'input' },
  { title: 'BPD(mm)', key: 'bpd', type: 'input' },
  { title: '超声孕周', key: 'gestationalWeek', type: 'input' },
  { title: 'FL(mm)', key: 'fl', type: 'input' },
  { title: 'HL(mm)', key: 'hl', type: 'input' },
  { title: 'AFV(mm)', key: 'afv', type: 'input' },
  { title: '胎盘厚度(mm)', key: 'fetalThickness', type: 'input' },
  { title: '胎盘位置', key: 'fetalPosition', type: 'input' },
  { title: '脐静脉直径(mm)', key: 'umbilicalVeins', type: 'input' },
  { title: '胎心率(bpm)', key: 'fhr', type: 'input' },
  { title: '备注', key: 'remark', type: 'input' },
];
/**
 *  麻醉方法
 */
export const anesthesiaMethodOptions = toOptions('全部麻醉,局部麻醉,复合麻醉,其他');


/**
 * 送检项目 树形选择器数据
 */
export const sjTreeOptions = [
  {
    value: 'genic',
    label: '遗传学检查',
    children: [
      { value: 'chromosome_karyotype', label: '染色体核型', },
      { value: 'chromosomal_microarray', label: '染色体微阵列', },
      { value: 'FISH', label: 'FISH', }
    ],
  },
  {
    value: 'infection',
    label: '感染',
    children: [
      { value: 'infection3', label: '感染三项DNA/RNA', },
      { value: 'infectionlgm', label: '感染三项lgM', },
      { value: 'infectiongaint', label: '巨细胞DNA', },
      { value: 'infectionRubella', label: '风疹病毒RNA', },
      { value: 'infectiontox', label: '弓形虫DNA', },
      { value: 'infectioncoxsackie', label: '柯萨奇病毒RNA', },
      { value: 'infectionb19', label: 'B19病毒核酸检测', }
    ],
  }, {
    value: 'hemolytic_anemia',
    label: '溶血性贫血',
    children: [
      { value: 'hemolytic_anemia1', label: '血常规全套', },
      { value: 'hemolytic_anemia2', label: '血常规五类', },
      { value: 'hemolytic_anemia3', label: '血型', },
      { value: 'hemolytic_anemia4', label: '新生儿血清学组合', },
      // {value: 'hemolytic_anemia5', label: '弓形虫DNA',},
      { value: 'hemolytic_anemia6', label: '直接抗人球蛋白试验（coombs实验）', },
      { value: 'hemolytic_anemia7', label: '肝代谢组合', }
    ],
  }, {
    value: 'thalassemia',
    label: '地中海贫血检测',
    children: [
      { value: 'thalassemia1', label: '地贫筛查组合（Hb电泳）' },
      { value: 'thalassemia2', label: '地中海贫血基因全套' },
      { value: 'thalassemia3', label: 'α地贫基因检测' },
      { value: 'thalassemia4', label: 'β地贫基因检测' },
      { value: 'thalassemia5', label: '血常规全套' },
      { value: 'thalassemia6', label: '血常规五分类' },
      { value: 'thalassemia7', label: '血型' },
    ],
  }, {
    value: 'hydrothorax_ascites',
    label: '胸腹水检查',
    children: [
      { value: 'hydrothorax_ascites1', label: '胸腹水全套', },
      { value: 'hydrothorax_ascites2', label: '胸腹水生化组合', },
      { value: 'hydrothorax_ascites3', label: '肝代谢组合', }
    ]
  }, {
    value: 'HF',
    label: '心衰检查',
    children: [
      { value: 'HF1', label: '心质组合', },
      { value: 'HF2', label: '心酶组合', },
      { value: 'HF3', label: '脑钠素BNP', }
    ]
  }, {
    value: 'other',
    label: '其他检查',
    children: [
      { value: 'other1', label: 'AFP', },
      { value: 'other2', label: '其他', }
    ]
  }];

/**
 * 绒毛活检的 送检
 */
export const rmSjTreeOptions = [
  {
    value: 'genic',
    label: '遗传学检查',
    children: [
      { value: 'chromosome_karyotype', label: '染色体核型', },
      { value: 'chromosomal_microarray', label: '染色体微阵列', },
      { value: 'FISH', label: 'FISH', }
    ]
  },{
    value: 'infection',
    label: '感染',
    children: [
      { value: 'infection3', label: '感染三项DNA/RNA', },
      { value: 'infectionlgm', label: '感染三项lgM', },
      { value: 'infectiongaint', label: '巨细胞DNA', },
      { value: 'infectionRubella', label: '风疹病毒RNA', },
      { value: 'infectiontox', label: '弓形虫DNA', },
      { value: 'infectioncoxsackie', label: '柯萨奇病毒RNA', },
      { value: 'infectionb19', label: 'B19病毒核酸检测', }
    ],
  },{
    value: 'thalassemia',
    label: '地中海贫血检测',
    children: [
      { value: 'thalassemia1', label: '地贫筛查组合（Hb电泳）' },
      { value: 'thalassemia2', label: '地中海贫血基因全套' },
      { value: 'thalassemia3', label: 'α地贫基因检测' },
      { value: 'thalassemia4', label: 'β地贫基因检测' }
    ]
  }
]

/**
 * 血库情况
 */
export const bloodBankOptions = toOptions('全血,洗涤,悬浮,浓缩');


