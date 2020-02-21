import { editTypes, eventFns } from './extend';

import validFn from './valid';

import * as inputs from './input';
import * as selects from './select';
import * as dates from './date';
import * as times from './time'; 
import * as buttons from './button';
import * as cascader from './cascader';
import * as treeselect from './treeselect';
import * as mixs from './mix';
import { pharmacyinput } from './businessComponent';
console.log(pharmacyinput);
/**
 * 所有编辑组件
 */
export const types = editTypes;
/**
 * 验证
 */
export const valid = validFn;

export const events = eventFns;

/**
 * 所有的编辑器
 */
export const editors = {...inputs,...selects,...times,...dates,...buttons,...mixs,...cascader,...treeselect,pharmacyinput: pharmacyinput};

console.log(editors);
export default {
  types,
  valid,
  events,
  editors
}
