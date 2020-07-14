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

    let form_check = function (obj){
        
    }
    
    _win.yi_public = _win.yi_public || {};
    _win.yi_public.form_check = form_check;
    return form_check;
});