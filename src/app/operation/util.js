import React, { Component } from "react";
import { Input } from 'antd';

import tableRender from '../../render/table';

export function countWeek(date){
  var days = Math.ceil(((new Date(date) - new Date()) / (1000 * 3600)) / 24);
  return `${Math.floor(days / 7)}+${days % 7}`;
}

export function formateDate() {
  let date = new Date();
  const m = date.getMonth() + 1, d = date.getDate();
  return `${date.getFullYear()}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`
}

export function getWeek(param1, param2) {
  let day1 = param1 * 7;
  let day2;
  if (param2.indexOf('+') !== -1) {
    day2 = param2.split('+');
    day2 = parseInt(day2[0] * 7) + parseInt(day2[1]);
  } else {
    day2 = parseInt(param2) * 7;
  }
  let days = day1 - day2;
  return `${Math.floor(days / 7)}+${days % 7}`;
}

// 将后台返回的string转为object
export const convertString2Json = function(str) {
  if(str === null || str === undefined) return ;
  const splitKey = "},{";
  let index = str.indexOf(splitKey);
  if(index === -1) {
    try{
      return JSON.parse(str);
    }catch (e){
      console.log(`字符串${str}非json格式数据`);
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
