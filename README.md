# 表单验证（form_check）此文件自己设计用的是作用域链编写
## 使用样例可参考dist/test.html
## 使用样例
```javascript

//自己扩展校验方法，不能同已有的重名
yi_public.form_check.set_check('real_namea', obj => {
    let val = obj.val,
        not_empty = obj.check.is_empty(obj),
        rev = not_empty.REV,
        msg = not_empty.MSG;
    if(rev && !/^\s*[\u4e00-\u9fa5]{1,}[\u4e00-\u9fa5.?]{0,15}[\u4e00-\u9fa5]{1,}\s*$/.test(val) || val.length > 20){
        rev = false;
        msg = '请输入正确真实姓名';
    }else if(val.indexOf(' ') > -1){
        rev = false;
        msg = '不能有空格';
    }
    return {
        REV: rev,
        MSG: msg,
        AAA: '我是校对方法里自定义的值（可以写安全等组）'
    };
});


var input = document.querySelectorAll('input');
var return_content = yi_public.form_check.content({
    form_name: 'aaaa',      //如果页面有多少表单时可取名字进行实别
    target: input[0],       //要验证input的dom元素（//dome对像 || #ID || div）
    tips: ".input_err",     //*报错信息的dom元素（//dome对像 || #ID || div）
                            //*如果不写，会自动在input后面加一个"span"，
                            //*报错信息会自动加“error_tips”的样式。

    entry: "请输入时提示",    //在输入时的提示内容在上面“dom_tip”元素里，
                            //样式名“warn_tips”。

    check: "real_namea",    //验证类型，可参考下面的验证类型列表必填
    required: true,         //是否是强校验
    result: function(obj){  //回调,在光标移开时执行
        console.log(obj);
        //当光标进行时每0.6秒校对一次并返回obj
        //obj的值如下
        // {
        //     REV: rev,
        //     MSG: msg
        //     target: target;
        //     tips: tips;
        //     AAA: '我是校对方法里自定义的值（可以写安全等级）'
        // }
    }
});
console.log(return_content);
//return_content的值
// {
//     target: target,
//     tips: tips
// }


//能输入的文本进行校验
var return_check = yi_public.form_check.check({
    val: '41152219 8508', //要校验的文本值
    tips: ".input_err", //dome对像 || #ID || div
    check: "real_namea",
});
//return_check 值为 'false' or 'true';


yi_public.form_check.must(src) //如果页面有多少表单时可取名字进行校对


yi_public.form_check.notice({
    tips: '.className', //dome对像 || #ID || div
    rev: false, //true 时会让提示文字消失
    msg: '报错内容'
});

```

