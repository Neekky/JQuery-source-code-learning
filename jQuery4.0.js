//实现jQuery的id、class选择器，及设置css方法
(function () {
    function jQuery(selector) {
        //返回
        return new jQuery.prototype.init(selector);
    }
    jQuery.prototype.init = function(selector){
        //根据selector选出DOM，并且包装成jQuery对象返回
        this.length = 0;
        //传入id、class的情况
        if (typeof selector == "string" && selector.indexOf(".") != -1){
            var dom = document.getElementsByClassName(selector.slice(1));
        }else if(typeof selector == "string" && selector.indexOf("#") != -1){
            var dom = document.getElementById(selector.slice(1))
        }

        //传入的是dom对象的情况
        //在 HTML DOM 中，Element 对象表示 HTML 元素。
        // if (selector instanceof Element){
        //     this[0] = selector;
        //     this.length++;
        // }

        //传入null、undefined的情况,直接返回this，this={},需要先行判断，不然会在下面的dom.length == undefined判断句中报错
        if (selector == null || selector == undefined) {
            return this;
        }

        //如果等于undefined，证明只有一个值，不是个类数组
        //兼容处理selector instanceof Element
        if(selector instanceof Element || dom.length == undefined){
            this[0] = dom || selector;
            this.length ++;
        }else{
            //有多个值，就将每个对象都添加到this中，this指向jQuery
            for(var i = 0; i < dom.length; i++){
                this[i] = dom[i];
                this.length ++;
            }
        }
    };
    /* 正因为有了init函数通过循环选择出了每一个元素，才能给后面的方法循环操作每一个DOM */
    jQuery.prototype.css = function(config){
        //this指向的是jQuery原型，此时原型里有多个选中的对象，循环设置css属性
        for(var i = 0; i < this.length; i++){
            for(var attr in config){
                //给每一个dom循环设置css属性
                this[i].style[attr] =config[attr] ;
            }
        }
        //链式操作的关键 返回调用对像，供下次使用
        return this;
    };

    //相当于给传递的dom对象，添加一个prevObject属性，再返回回去，以供end方法使用
    jQuery.prototype.pushStack = function(dom){
        if(dom.constructor != jQuery){
            dom = jQuery(dom);
        }
        dom.prevObject = this;
        return dom;
    };

    //实现jQuery的get方法
    jQuery.prototype.get = function(index){
        // if (index == null){
        //     //空截内数组，立马变成数组
        //     return Array.prototype.slice.call(this,0);
        // } else {
        //     if (index >= 0){
        //         return this[num]
        //     } else {
        //         var len = this.length;
        //         return this[index + len];
        //     }
        // }
        //三目运算符
        var len = this.length;
        return index != null ? (index >= 0 ? this[index] : this[index + len]) : [].slice.call(this,0);
    };

    //实现jQuery的eq方法
    jQuery.prototype.eq = function(index){
        var len = this.length;
        var dom = index != null ? (index >= 0 ? this[index] : this[index + len]) : null;
        return this.pushStack(dom);
    };

    //实现jQuery的add方法
    jQuery.prototype.add =function(selector){
        var curObj = jQuery(selector);
        var baseObj = this;
        var newObj = jQuery();
        for (var i = 0; i < curObj.length; i++){
            //this.length++,刚好使其成为索引，this.length从0开始
            newObj[newObj.length++] = curObj[i];
        }
        for (var i = 0; i < baseObj.length; i++){
            newObj[newObj.length++] = baseObj[i];
        }
        //返回带有prevObject属性的newObj
        return this.pushStack(newObj);
    };

    //实现jQuery的end方法
    jQuery.prototype.end = function(){
        return this.prevObject
    };

    //只能处理
    //实现jQuery的on方法,只能处理自定义事件，因为没对系统原生dom事件进行处理
    jQuery.prototype.on = function(type,handle){
        for (var i = 0; i < this.length; i++) {
            //判断这个标签有没有自定义事件，如果没有就创建一个，用于存储事件
            if (!this[i].cacheEvent) {
                this[i].cacheEvent = {};
            }
            //判断对象中有没有存过type类型的事件，如果没有就存一个，对应传入的handle函数
            // cacheEvent[type]语法 == cacheEvent.type
            if (!this[i].cacheEvent[type]) {
                this[i].cacheEvent[type] = [handle];
            }else{
                this[i].cacheEvent[type].push(handle);
            }
        }
    };

    //实现jQuery的trigger方法，只能处理自定义事件，因为没对系统原生dom事件进行处理
    jQuery.prototype.trigger = function(type){
        //保存this，this为带着事件的jQuery对象
        var self = this;
        var params;
        //接收args参数，存为数组
        if (arguments.length > 1 && e instanceof arguments) {
            params = [].slice.call(arguments,1);
        } else {
            params = [];
        };

        for (var i = 0; i < this.length; i++) {
            if (this[i].cacheEvent[type]) {
                this[i].cacheEvent[type].forEach(function (ele,index) {
                    ele.apply(self,params);
                })
            }
        }
    };

    //实现jQuery队列功能
    jQuery.prototype.queue = function (type,handle) {
        //jq对象
        var queueObj = this;
        //未传入队列名称时，默认为"fx"
        var queueName = arguments[0] || "fx";
        var addFunc = arguments[1] || null;
        var len =arguments.length;
        //根据len的参数长度，来判断该怎么执行程序
        //len为1，说明是想获取队列
        if (len == 1) {
            return queueObj[0][queueName];
        }
        // len大于1，说明是想添加新队列，或往已有队列中添加元素
        // 这里将数据存储到jq对象的dom上。
        queueObj[0][queueName] == undefined ? queueObj[0][queueName] = [addFunc] : queueObj[0][queueName].push(addFunc);
        return this;
    };

    //实现jQuery出栈功能
    jQuery.prototype.dequeue = function (type) {
        //为next方法将this保存下来，不然next中的this指向window
        var self = this;
        var queueName = arguments[0] || "fx";
        //使用queue方法来获取队列
        var queueArr = this.queue(queueName);
        var currFunc = queueArr.shift();
        if (currFunc == undefined) {
            return;
        }
        var next = function () {
            self.dequeue(queueName);
        };
        //给每一个队列中函数留个接口，传入一个next函数，用来不断执行队列中的函数
        currFunc(next);
        return this;
    };





    //将jQuery的原型赋给init的原型，使init初始化的jQuery对象，
    // 能调用jQuery的原型方法
    jQuery.prototype.init.prototype = jQuery.prototype;
    //将引用值挂载到全局变量，内部函数被返回到外部，形成了一个闭包
    window.$ = window.jQuery = jQuery;
})();