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
 *无、有
*/
export const hnOptions = toOptions('无,有');
/**
 *有、无
*/
export const nhOptions = toOptions('无,有(input){#FF3300}');

export const wssOptions = toOptions([{k: '无', span: 2},{ k: '有{#FF3300}(input)'}]);

export const sxsOptions = toOptions([{k: '无', span: 2},{ k: '有{#FF3300}(bloodinput)'}]);

/**
 *下肢浮肿
*/
export const xzfOptions = toOptions('-,+,+-,++,+++');


/**
 * 基因型贫血
 */
export const genotypeAnemia = toOptions('β地中海贫血基因CD14-15突变,β地中海贫血基因CD17突变,β地中海贫血基因CD27/28突变,β地中海贫血基因CD41-42突变,β地中海贫血基因CD43突变,β地中海贫血基因CD71-72突变,β地中海贫血基因βE突变,β地中海贫血基因-32突变,β地中海贫血基因CD31突变,β地中海贫血基因30突变,β地中海贫血基因-29突变,β地中海贫血基因-28突变,β地中海贫血基因IVS-I-1突变,β地中海贫血基因IVS-II-654突变,β地中海贫血基因IVS-I-5突变,β地中海贫血基因CAP+1突变,β地中海贫血基因IntM突变,a地中海贫血基因SEA缺失,a地中海贫血基因3.7缺失,a地中海贫血基因4.2缺失,a地中海贫血基因QS突变,a地中海贫血基因WS突变,a地中海贫血基因CS突变')



/**
 *药物或食物过敏史
*/
export const ywgmOptions = toOptions('无,药物{#FF3300}(input),食物{#FF3300}(input),其他{#FF3300}(input)');

/**
 * 初潮
 */
export const ccOptions = toOptions('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');

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
		mode: "ymd"
	},
	{
		title: '手术医院',
		key: 'hospital',
		type: 'select',
		options: [
			{value: '中山一院', label: '中山一院'},
			{value: '中山二院', label: '中山二院'},
			{value: '中山三院', label: '中山三院'},
			{value: '广医一院', label: '广医一院'},
			{value: '广医三院', label: '广医三院'},
			{value: '省中医院', label: '省中医院'},
			{value: '省妇幼', label: '省妇幼'},
		]
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
		key: 'yunzh',
		type: 'input'
	},
	{
		title: 'BPD',
		key: 'bpd',
		type: 'input',
	},
	{
		title: 'HC',
		key: 'hc',
		type: 'input'
	},
	{
		title: 'AC',
		key: 'ac',
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
		key: 'ubf',
		type: 'input'
	},
	{
		title: '其他异常描述',
		key: 'errorDesc',
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



export const newDataTemplate = {
	userid: "",
	formType: "1",
	id: "",
	createdate: "",
	chief_complaint: "",
	medical_history: "",
	diagnosis: "",
	treatment: "",
	doctor: "",
	other_exam: "",
	karyotype: "",
	pregnancy_history: {
		// gravidity: "",
		// parity: "",
		// exfetation: "",
		// lmd: "",
		// edd: "",
		// abortion: ""
	},
	downs_screen: {
		early: {
			// trisomy21: "",
			// trisomy18: "",
			// trisomy13: "",
			// other_anomalies: "",
			// hcg: "",
			// papp: ""
		},
		middle: {
			// trisomy21: "",
			// trisomy18: "",
			// trisomy13: "",
			// other_anomalies: "",
			// hcg: "",
			// ntd: "",
			// e3: "",
			// afp: ""
		},
		nipt: {
			// trisomy21: "",
			// trisomy18: "",
			// trisomy13: "",
			// other_anomalies: "",
			// z_value: "",
			// z21: "",
			// z18: "",
			// z13: ""
		}
	},
	thalassemia: {
		wife: {
			// blood_group: "",
			// genotype: "",
			// other_anomalies: "",
			// mcv: "",
			// mch: "",
			// hb: "",
			// hbA2: ""
		},
		husband: {
			// blood_group: "",
			// genotype: "",
			// other_anomalies: "",
			// mcv: "",
			// mch: "",
			// hb: "",
			// hbA2: ""
		}
	},
	ultrasound: {
		menopause: '',
		fetus: [
			{
				id: '-1',
				userId: '',
				status: '',
				// crl: "",
				// crlweek: "",
				// nt: "",
				// excdesc: "",
				shousxm: '',
				shousbh: '',
				shuz: '',
				zhus: '',
				startTime: '',
				endTime: '',
				chixsj: '',
				zhig: '',
				taip: '',
				fangf: '',
				qix: '',
				quywz: '',
				jinrgqcs: '',
				yangb: '',
				xingz: '',
				yuancpg: '',
				shuztsqksm: '',
				shuqtxl: '',
				shuhtxl: '',
				diagnose: '',
				shifzccc: '',
				yangs: '',
				qixue: '',
				longm: '',
				prenatalOperationId: '',
				puncturePosition: '',
				placentaHemorrhage: '',
				uterineWallHemorrhage: '',
				inspectionItems: '',
				isPharmacy: '',
				operationName: '',
				operationLevel: '',
				incisionType: '',
				punctureCount: '',
				perfusionVolume: '',
				intubationFrequency: '',
				aspirationTimes: '',
				negativePressure: '',
				timesOfNeedleInsertion: '',
				numberOfHits: '',
				omphalorrhagia: '',
				villusVolume: '',
				whetherBleeding: '',
				cordBloodVolume: '',
				embryoReductionTarget: '',
				vanishingTimeOfFetalHeart: '',
				returnLiquid: '',
				punctureObject: '',
				drawSheepWater: '',
				targetHct: '',
				calculationOfBloodTransfusionVolume: '',
				actualTransfusionVolume: '',
				transfusionSpeed: '',
				liquidVolume: ''
			}
		]
	},
	past_medical_history: {
		hypertension: [],
		diabetes_mellitus: [],
		heart_disease: [],
		injury: [],
		other_disease: [],
		allergy: [],
		blood_transfusion: [],
		operation_history: []
	},
	family_history: {
		diabetes_mellitus: [],
		hypertension: [],
		heritable_disease: [],
		congenital_malformation: []
	},
	physical_check_up: {
		systolic_pressure: "",
		diastolic_pressure: "",
		edema: {},
		// fundal_height: "",
		// waist_hip: "",
		// pre_weight: "",
		// current_weight: "",
		// weight_gain: "",
		bp: {}
	},
	rvisitId: '',
	ckweek: '',
	stateChange: '',
	lastResult: ''
}