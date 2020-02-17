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
                {name: "键名", type: "类型", span: 栅格}  
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

### 各类插件值的设置与获取
> ##### checkinput
|键名|类型|含义|
|-----|-----|-----|
|label|string|对应checkinput选中checkbox值|
|value|string、number|对label的补充|
请传入[{value:"",label:""},{value:"",label:""}]
- 有 [{value: "有", value: "补充"}]
- 无 [{value: "无",label: "无"},{value: "unselect",label: ""}]
> ##### 