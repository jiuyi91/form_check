/**
 * yizq 2020/06/29. 整理以前的代码些项目做了大概30个类大型活动，在此上做二次开发,此项目第一次用是2016年2月
 *
 */
;(function definelayer(global, factory) {
    var form_check = factory(global);
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
        var parent = target.parentNode;
        if (parent.lastChild == target) {
            parent.appendChild(new_el);
        } else {
            parent.insertBefore(new_el, target.nextSibling);
        }
    }

    let form_list = {};

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

            let blur_fn = () => {
                let val = obj.target.value || '',
                    result = form_check._check_name[obj.check]({
                        val: val
                    });//,
                    //ev = ev || _win.event || {};
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
                form_check.notice({
                    target: obj.target,
                    tips: obj.tips,
                    msg: obj.entry,
                    rev: obj.entry ? false : true,
                    type: 'focus'
                })
            }, false);

            console.log(obj);
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
        set_check: (name, check_fn) => {},
        _check_name: {
            is_empty: (obj) => {
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
            },
            is_email: (obj) => {
                let val = obj.val,
                    not_empty = form_check._check_name.is_empty(obj),
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
            }
        }
    }

    _win.yi_public = _win.yi_public || {};
    _win.yi_public.form_check = form_check;
    return form_check;
});