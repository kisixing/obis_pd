# FormRender

### 基本使用方法
> 使用形式
<div>{formRender(entity, config, handleChange)}</div> 

> ##### 参数说明
|键名|类型|含义|
|-----|-----|-----|
|entity|object|传入表单初始值|
|config|object|渲染结构|
|handleChange|function|回调方法
补充说明
- 根据entity下键名设置初始值
- 根据config渲染表单,格式如下
```
{
    step,
    rows:[ // 行
        {
            columns: [      // 列
                {name: "键名", type: "类型", span: 栅格, valid: 校验规则,...} // 省略键值说明见下列组件 `补充设置` 说明 
            ]
        }
    ]
}
```
- handleChange 传出参数
```
{
    e, // event
    {
        name,       // 当前输入键名
        value,      // 当前值
        error,      
        entity,     // 初始入参的整个entity
        target
    }
}
```

### formRender配置
|键名|类型|含义|备注|
|-----|-----|-----|-----|
|name|string|输入对象中的键名，用于值的自动获取|请使用'键名\[标题\](单位)'的形式|
|type|string/Array|组件类型|如为数组，可输入filter过滤|

### 各类插件值的设置与获取
> ##### checkinput

- options键值说明

|键名|类型|含义|
|-----|-----|-----|
|label|string|对应checkinput选中checkbox值|
|value|string、number|对label的补充|

设置初始值请传入[{value:"",label:""},{value:"",label:""}]
- 有 [{value: "有", value: "补充"}]
- 无 [{value: "无",label: "无"},{value: "unselect",label: ""}]

备注 一定需要传入数组，不然会报
```
Cannot update during an existing state transition (such as within `render`).
```
应该是render时值不符合规则导致再次更新所报错，且render不会成功

回调value形式同上

> ##### select

- 配置键值说明

|键名|类型|含义|
|-----|-----|-----|
|showSearch|boolean|是否展示搜索输入框|
|tags|boolean|tags输入，支持自定义，更多请查看antd1.x文档|
|multiple|boolean|是否支持多选|
|radio|boolean|为true时仅能单选|
|custom|boolean|单选是否可以自定义输入|

！备注 showSearch开启后 tags与custom 的自定义输入功能才可以开启

- options 键值说明

|键名|类型|含义|
|-----|-----|-----|
|label|string|对应checkinput选中checkbox值|
|value|string、number|对label的补充|

设置请传入 {value: "", label: ""}

！备注 select是第一个单选框，仅能传入对象，不可使用数组包裹

回调value形式同上

<b>修改记录</b>
- 2020-03-31
1.改为class
2.部增加包裹层进行composition的监听，使用延时策略确保了事件顺序

> ##### table

- options（tableColumn） 键值说明

|键名|类型|含义|
|-----|-----|-----|
|title|string|表头,若为空，则默认不渲染且不占位|
|key|string、number|唯一标识，对应传入对象键值|
|type|'input、select等'|表单呈现内容组件载体，需使用src/render/common/下存在组件|
|isShow|boolean|是否显示该项值|
|children|tableColumn|子元素|

行与列的合并不可使用ant-design中的rowSpan与colSpan

如果需要使用多层表头 - 相关方法在src/render/common/table.js中

需要把columnsOptions写为下面形式
```
const columnsOptions = [
    {title: '我是第一层表头',key: 'header', children:[
        {title: '我是第二层表头a',key:'a',type:'input'},
        {title: '我是第二层表头b',key:'b',type:'input'},
    ]}
]
```
传入数据说明
传入数据的键名需要与tableColumns中定义相同才可以渲染
> 新增配置：在数据中设置isShow=false，可以不显示数据

补充配置

|键名|类型|含义|
|-----|-----|-----|
|pagination|boolean|table是否显示分页|
|editable|boolean|是否可以编辑|
|buttons|boolean|可编辑模式下是否显示buttons|



> ##### treeselect

options键值说明

|键名|类型|含义|
|-----|-----|-----|
|label|string|显示值，标签|
|value|string|选中值，全树唯一|
|children|Array[options]|treenode子对象|

补充配置

|键名|类型|含义|
|-----|-----|-----|
|isSelectParent|boolean|是否可以选中父类|
|value|object&array|请以{value:"",label:""}形式设置|
|multiple|boolean|是否支持多选|

> ##### pharacyinput(业务组件)

特定使用用于是否用药后置输入框

设置初始值与checkinput相同，在value中请传入字符串`<药物名称>|<用药量>`

本组件会以`|`自动分割，回调值也是如此。


### 存在的一些问题

> table

1.使用editable的时候，添加/删除只会传出默认的handleChange，对外是没有说明`删除/增加`事件
