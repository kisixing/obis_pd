import  NO2ROOT from '../../utils/china-division/no2root';
import { IDReg } from './validFn';
/**
 * 根据用户身份证解析相关信息
 * @param {id} - string 用户身份证
 * 
 * return {age:number,root:string} | false
 */
export const getInfoFormID = (id) => {
  if(id && IDReg.test(id)){
    for(let i = 0; i < NO2ROOT.length; i++){
      if(NO2ROOT[i].code === id.substring(0,6)){
        return {
          age: Number(new Date().getFullYear()) - Number(id.substring(6,10)),
          root: NO2ROOT[i].name
        }
      }
    }
  }
  return false;
}