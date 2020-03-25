

/**
 * 如果不想在value里面使用label的数据，可以换成用index作为value
 *  用于转换信息=> {lable:'', value:''}
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

export const hyOptions = toOptions('未婚,已婚,丧偶,离婚');

export const IDCardOptions = toOptions('居民身份证,港澳居民来往内地通行证,台湾居民来往大陆通行证,外国人居留证 ,护照');

export const numberOptions = toOptions('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15');

export const occupationOptions = toOptions('国家公务员,专业技术人员,企业管理人员,自由职业者,工人,现役军人,个体经营者,职员,农民,学生,退（离）休人员，其他');

export const nationList = toOptions("汉族,壮族,满族,回族,苗族,维吾尔族,土家族,彝族,蒙古族,藏族,布依族,侗族,瑶族,朝鲜族,白族,哈尼族,哈萨克族,黎族,傣族,畲族,傈僳族,仡佬族,东乡族,高山族,拉祜族,水族,佤族,纳西族,羌族,土族,仫佬族,锡伯族,柯尔克孜族,达斡尔族,景颇族,毛南族,撒拉族,布朗族,塔吉克族,阿昌族,普米族,鄂温克族,怒族,京族,基诺族,德昂族,保安族,俄罗斯族,裕固族,乌孜别克族,门巴族,鄂伦春族,独龙族,塔塔尔族,赫哲族,珞巴族");