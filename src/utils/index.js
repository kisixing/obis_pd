// 将后台返回的string转为object
export const convertString2Json = function (str = "") {
  const splitKey = "},{";
  let index = str.indexOf(splitKey);
  if (index === -1) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(`字符串${str}非json格式数据`);
      return
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
  resArr.push(JSON.parse(str));
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