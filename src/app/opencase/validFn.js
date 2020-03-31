export const IDReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
const numberReg = /^1[3456789]\d{9}$/;
/** 
 *  身份证校验
 *  @param {value} - {"0": {value:"",label:""}, "1": string}
 *  @param {isP}   - boolean 判断是否为孕妇
*/
export const validIDCard = (value = {}, isP = true) => {
  const IDType = ('0' in value) ? value['0'] : "", IDNumber = ('1' in value) ? value['1'] : "";
  if (!IDType) return "*请选择证件类型";
  if (IDType.value === '居民身份证' && IDNumber) {
    if (IDReg.test(IDNumber)) {
      if(isP){
        if (Number(IDNumber.slice(16, 17)) % 2 === 1) return "*请输入女性身份证";
      }else{
        if (Number(IDNumber.slice(16, 17)) % 2 !== 1) return "*请输入男性身份证";
      }
    } else {
      return "*居民身份证格式错误"
    }
  }
}

/**
 * 验证手机号码
 * @param {n} - string number
 */
export const validPhoneNumber = (n = "") => {
  if(n === "") return "";
  return numberReg.test(n) ? "" : "*请输入正确的手机号码"
}

/**
 * 校验地址输入
 * @params {address} - {"0": {value:"",label:""}, "1": string}
 */
export const validAddress = (address = {}) =>  {
  // if(!address) return "*请输入完整户口地址";
  if('0' in address && '1' in address){
    return (!address['0'] || !address['1']) ? "*请输入完整户口地址" : "";
  }
  return "*请输入完整户口地址";
}


