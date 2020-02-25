## 手术记录页面说明
因该页面模板较多，先于前端将其编号
根据不同的手术项目返回不同的编号决定渲染

> 模板类型

|手术项目名称|对应TemplateID|
|-----|-----|
|羊膜腔穿刺|0|
|绒毛活检|1|
|脐带穿刺|2|
|羊膜腔灌注|3|
|选择性减胎|4|
|羊水减量|5|
|宫内输血|6|
|胸腔积液/腹水/囊液穿刺|7|
|胎儿病历|8|
- 请使用operation/index.js中currentData[i].operationItemTemplateId识别

> 流程说明

1.先从服务获取operationList并渲染为一个tree型的结构

2.通过点击treeNode从服务器获取operationdetail保存至operationDataList数组

3.以currentTreeKeys中第一个数字（有且仅有一个）作为参数，进入operationDataList中寻找需要显示的数据

- ####为何什么要这样做？
主要的考虑在于用户新增两个病历时，本地存储未完成病历的数据，也可以通过上面形式渲染。
否则待完善病历 与 已完成病历分设再不同的对象中，逻辑实现较为麻烦。

> fireForm 使用
```
import { fireForm } from './src/render/common/valid.js';
// node - dom对象，fireForm会将改node中所有含有.form-item类的元素找到，然后遍历dosomething
// dosomething<string> - 传入'valid'会进行校验,传入'reset'会将其重置
fireForm(node,dosomething).then(res => {
    if(res){
        // 通过校验
    }else{
        // 不通过校验
    }
})
```
不要在formRender下的handleChange使用fireForm，因为当其valid或者reset会重新触发change事件导致栈的溢出


