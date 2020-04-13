const STRING_TYPE = '[object String]';
// 将后台返回的string转为object
export const convertString2Json = function (str) {
  if(!str || Object.prototype.toString.call(str) !== STRING_TYPE) return str;
  const splitKey = "},{";
  let index = str.indexOf(splitKey);
  if (index === -1) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(`字符串${str}非json格式数据`);
      return str;
    }
  }
  let len = str.length, resArr = [];
  // 去掉前后的括号
  str = str.substring(1, len - 1);
  index = str.indexOf(splitKey);
  while (index !== -1) {
    try {
      resArr.push(JSON.parse(str.substring(0, index + 1)));
    } catch (e) {
      console.log('此字符串非json格式数据');
    }
    str = str.substring(index + 2, len);
    len = str.length;
    index = str.indexOf(splitKey);
  }
  try{
    resArr.push(JSON.parse(str));
  }catch(e) {
    console.log(`${str}格式错误`);
    return str;
  }
  return resArr;
};

// 根据末次月经计算预产期
export function GetExpected(gesmoc) {
  var tmpdate = new Date(gesmoc).getTime();
  console.log(tmpdate);
  tmpdate = tmpdate + 280 * 24 * 60 * 60 * 1000;
  tmpdate = new Date(tmpdate);
  var new_y = tmpdate.getFullYear();
  var new_m = tmpdate.getMonth() + 1;
  if (new_m < 10) {
    new_m = "0" + "" + new_m
  }
  var new_d = tmpdate.getDate();
  if (new_d < 10) {
    new_d = "0" + "" + new_d
  }
  var newdate = new_y + "-" + new_m + "-" + new_d;
  return newdate
};

// 获取当前日期
export function formatDate() {
  let date = new Date();
  const m = date.getMonth() + 1, d = date.getDate();
  return `${date.getFullYear()}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`
}

/**
 * 求两个时间差值
 * @param {hh:mm} t1 
 * @param {hh:mm} t2 
 * 使用 t2 - t1
 */
export const getTimeDifference = (t1,t2) => {
  const arr1 = t1.split(':');
  const arr2 = t2.split(':');
  let hourDifference = Number(arr2[0]) - Number(arr1[0]);
  let minDifference = Number(arr2[1]) + 60 - Number(arr1[1]);
  return (hourDifference-1)*60+minDifference;
}

// 根据字符串在一个对象中确定最下层键值 - 使用时请先复制您的object得出新的对象，再进行react复制操作
/**
 * 在此函数内对value赋值
 * @param obj 赋值对象 NOTICE 一定是对象，不能为数组
 * @param keyStr 路径 形式为 "key1.key2-key3"  .代表对象 -代表数组   如果没有. - 代表第一层
 * @param val value
 */
const OBJECT_SPLIT_KEY = ".";
const ARRAY_SPLIT_KEY = "-";
export const mapValueToKey = (obj, keyStr = "", val) => {
  if (keyStr === "") return;
  // check "." "-"
  const objectIndex = keyStr.indexOf(OBJECT_SPLIT_KEY);
  const arrayIndex = keyStr.indexOf(ARRAY_SPLIT_KEY);
  const len = keyStr.length;
  console.log(keyStr);
  if (objectIndex === -1 && arrayIndex === -1) {
    obj[keyStr] = val;
  } else if (objectIndex < arrayIndex || (objectIndex !== -1 && arrayIndex === -1)) {
    const nextKey = keyStr.slice(0, objectIndex);
    if (!obj.hasOwnProperty(nextKey)) {
      obj[nextKey] = {};
    }
    mapValueToKey(obj[nextKey], keyStr.slice(objectIndex + 1, len), val);
  } else {
    // 检查到 - ，是数组，try-catch
    const nextKey = keyStr.slice(0, arrayIndex);
    if (Object.prototype.toString.call(obj[nextKey]) !== "[object Array]") {
      obj[nextKey] = [];
    }
    console.log(obj);
    mapValueToKey(obj[nextKey], keyStr.slice(arrayIndex + 1, len), val);
  }
}