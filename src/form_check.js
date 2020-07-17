/**
 * yizq 2020/06/29. 整理以前的代码些项目做了大概30个类大型活动，在此上做二次开发,此项目第一次用是2016年2月
 *
 */
;(function definelayer(global, factory) {
    let form_check = factory(global);
    //给类注入到window上，方便业务二次调用
    if (typeof exports === 'object' &&  exports && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = form_check;        
    } else if (typeof define === 'function' && define.amd) {
        //AMD
        define(['exports'], form_check);    
    }
    
    global.form_check = form_check;

})(this, function (global, undefined) {
    'use strict';
    //多次调用时的共有方法
    let _win = window,
        _doc = document;

    let get_dom = (dom) => {
        if(typeof dom === 'string'){
            dom = _doc.querySelector(dom);
        }
        if(dom && dom.tagName){
            return dom;
        }else{
            console.error('form_check:请检查你传入的元素是否正确。')
        }
    }

    let insert_after = (new_el, target) => {
        let parent = target.parentNode;
        if (parent.lastChild == target) {
            parent.appendChild(new_el);
        } else {
            parent.insertBefore(new_el, target.nextSibling);
        }
    }

    let form_list = {};

    let _check_list = {};
    let _set_check = (name, check_fn) => {
        if(!_check_list[name]){
            _check_list[name] = check_fn;
        }else{
            console.error(name + '校验的名字已用过，请重新取一个名，已有的可在“yi_public.form_check._check_list”中查到')
        }
    }

    let form_check = {
        //在某元素里输入提示内容
        notice: (obj) => {
            obj.tips.classList.remove('error_tips');
            obj.tips.classList.remove('warn_tips');
            if(!obj.rev){
                obj.tips.innerHTML = obj.msg || '';
                if(obj.type === 'blur'){
                    obj.tips.classList.add('error_tips');
                }
                if(obj.type === 'focus'){
                    obj.tips.classList.add('warn_tips');
                }
            }else{
                obj.tips.innerHTML = '';
            }
        },
        //给某元素绑定校验方法
        content: (obj) => {
            obj.target = get_dom(obj.target);
            obj.tips = obj.tips && get_dom(obj.tips);
            
            //如果没有传入提示元素，在后面加一个提示元素
            if(!obj.tips){
                obj.tips = _doc.createElement('span');
                insert_after(obj.tips, obj.target);
            }

            obj.tips.classList.add('input_tips');

            if(obj.target.__form_check__content){
                console.error('此元素不能绑两次校验', obj.target)
                return;
            }
            obj.target.__form_check__content = true;

            let blur_timer = null;
            let blur_fn = () => {
                if(obj.result){
                    clearInterval(blur_timer);
                }
                let val = obj.target.value || '',
                    result = _check_list[obj.check]({
                        val: val,
                        check: _check_list
                    });
                form_check.notice({
                    target: obj.target,
                    tips: obj.tips,
                    msg: result.MSG,
                    rev: result.REV,
                    type: 'blur',
                });
                return result.REV;
            }

            
            let _form_name = obj.form_name || '0';
            form_list[_form_name] = form_list[_form_name] || []
            form_list[_form_name].push({
                _fn: blur_fn,
                _obj: obj
            });

            obj.target.addEventListener('blur', blur_fn, false);

            obj.target.addEventListener('focus', () => {
                if(obj.result){
                    clearInterval(blur_timer);
                    blur_timer = setInterval(() => {
                        let val = obj.target.value || '',
                            result = _check_list[obj.check]({
                                val: val,
                                check: _check_list
                            });
                        result.target = obj.target;
                        result.tips = obj.tips;
                        obj.result(result);
                    },600);
                }
                form_check.notice({
                    target: obj.target,
                    tips: obj.tips,
                    msg: obj.entry,
                    rev: obj.entry ? false : true,
                    type: 'focus'
                })
            }, false);
            return {
                target: obj.target,
                tips: obj.tips
            }
        },
        //只校验具体的值
        check: (obj) => {
            obj.tips = obj.tips && get_dom(obj.tips);

            let result = _check_list[obj.check]({
                val: obj.val,
                check: _check_list
            });

            if(obj.tips){
                form_check.notice({
                    tips: obj.tips,
                    msg: result.MSG,
                    rev: result.REV,
                    type: 'blur',
                });
            }
            return result.REV;
        },
        //校验content方法绑定的元素是否通过校验
        must: (str) => {
            let rev = true,
                required,
                required_rev = true,
                target_list = form_list[(str || '0')] || [];

            for(let i = 0; i < target_list.length; i++){
                let f = target_list[i]._fn();
                //如果配了必填项就只查必填项
                if(target_list[i]._obj.required){
                    required = true;
                    if( !f ){
                        required_rev = f; //这时 f = false;
                    }
                }
                if( !f ){
                    rev = f; //这时 f = false;
                }
            }

            if(required){
                return required_rev;
            }else{
                return rev;
            }
        },
        set_check: _set_check,
        _check_list: _check_list
    }

    _set_check('is_empty', (obj) => {
        let num = obj.val,
            msg = '',
            rev = true;
        if( num == '' || num == null ){
            rev =  false;
            msg = '不能为空'
        }
        return{
            REV: rev,
            MSG: msg
        };
    });

    _set_check('is_email', obj => {
        let val = obj.val,
            not_empty = obj.check.is_empty(obj),
            rev = not_empty.REV,
            msg = not_empty.MSG;

        if(rev && !(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(val)) ){
            rev = false;
            msg = '请输入正确的邮箱';
        }
        return{
            REV: rev,
            MSG: msg
        };
    });
    _set_check('phone', obj => {
        let num = obj.val.replace(/(^\s*)|(\s*$)/g,''),
            not_empty = obj.check.is_empty(obj),
            rev = not_empty.REV,
            msg = not_empty.MSG;
        if(rev && !/^(1)[3|4|5|6|7|8|9]\d{9}$/.test(num)){
            rev = false;
            msg = '请输入正确的手机号';
        }
        return{
            REV: rev,
            MSG: msg
        };
    });


    //验证姓名
    _set_check('real_name', obj => {
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
        return{
            REV: rev,
            MSG: msg
        };
    });

    //验证地址
    _set_check('address', obj => {
        let val = obj.val,
            not_empty = obj.check.is_empty(obj),
            rev = not_empty.REV,
            msg = not_empty.MSG,
            _msg_arr;
        if(rev && /[^\a-\z\A-\Z0-9\u4E00-\u9FA5\ ]/g.test(val)){
            _msg_arr = val.match(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\ ]/g) || [];
            rev = false;
            msg = '不得含有(' + _msg_arr.join(' ') + ')';
        }
        return{
            REV: rev,
            MSG: msg
        };
    });

    //验证地址
    _set_check('id_card', obj => {
        let num = obj.val,
            err_msg = '请输入正确身份证号码',
            len = num.length,
            wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ],
            valide_code = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ],
            val_code = 0,
            not_empty = obj.check.is_empty(obj),
            rev = not_empty.REV,
            msg = not_empty.MSG,
            //15位时的生日校对
            len_15_birthday = function(){
                var year =  num.substring(6,8),
                    month = num.substring(8,10),
                    day = num.substring(10,12),
                    temp_date = new Date( year, parseFloat(month) - 1, parseFloat(day) );
                if(temp_date.getYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month)-1 || temp_date.getDate() != parseFloat(day)){
                    return false;
                }else{
                    return true;
                }
            },
            len_18 = function (){
                var sum = 0,
                    num = obj.val.split("");
                if (num[17].toLowerCase() == 'x'){
                    num[17] = 10;
                }
                for( var i = 0; i < 17; i++){
                    sum += wi[i] * num[i];
                }
                val_code = sum % 11;
                if (num[17] != valide_code[val_code]){
                    return false;
                }else{
                    return true;
                }
            },
            len_18_birthday = function (){//isValidityBrithBy18IdCard
                var year =  num.substring(6,10),
                    month = num.substring(10,12),
                    day = num.substring(12,14),
                    temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
                if(temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)){
                    return false;
                }else{
                    return true;
                }
            };
        if(!rev){
            //msg = "请输入身份证号";
        }else if(rev && len == 15){
            if(!len_15_birthday()){
                rev = false;
                msg = err_msg;
            }
        }else if(rev && len == 18){
            if(!(len_18() && len_18_birthday())){
                rev =  false;
                msg = err_msg;
            }
        }else{
            rev =  false;
            msg = err_msg;
        }
        return{
            REV: rev,
            MSG: msg
        }
    });

    _win.yi_public = _win.yi_public || {};
    _win.yi_public.form_check = form_check;
    return form_check;
});