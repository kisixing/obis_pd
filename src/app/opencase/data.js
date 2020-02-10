

/**
 * 如果不想在value里面使用label的数据，可以换成用index作为value
 *  用于转换信息=> {lable:'', value:''}
 */
function toOptions(data, vfn =()=>({})){
  if(data instanceof Array){
    return data.map((v,i) => {
      const { k, ...rest } = v;
      return { ...rest, label: k || v, value: k || v, ...vfn(k || v,i) }
    })
  }
  if(data && typeof data === 'object'){
    return Object.keys(data).map((v,i) => ({ label: data[v], value: v, ...vfn(data[v],v,i) }))
  }
  if(typeof data === 'string'){
    return data.split(/[,;]/).map((v,i) => ({ label: v, value: v, ...vfn(v,i) }))
  }
  return [];
}

export const hyOptions = toOptions('未婚,已婚,丧偶,离婚');

export const numberOptions = toOptions('1,2,3,4,5,6,7,8,9');