// 将后台返回的string转为object
export const convertString2Json = function(str = "") {
  const splitKey = "},{";
  console.log(str);
  let index = str.indexOf(splitKey);
  if(index === -1) {
    try{
      return JSON.parse(str);
    }catch (e){
      console.log(`字符串${str}非json格式数据`);
      return 
    }
  }
  let len = str.length, resArr = [];
  // 去掉前后的括号
  str = str.substring(1,len-1);
  index = str.indexOf(splitKey);
  while(index !== -1) {
    try{
      resArr.push(JSON.parse(str.substring(0,index+1)));
    }catch (e) {
      console.log('此字符串非json格式数据');
    }
    str = str.substring(index+2, len);
    len = str.length;
    index = str.indexOf(splitKey);
  }
  resArr.push(JSON.parse(str));
  return resArr;
};