/**
 * Created by Boyce on 2016/3/27.
 */
/**
 * 跨浏览器事件处理
 */

var EventUtil = {
    /**
     * addHandler()的职责是视情况分别使用DOM级方法、DOM2级方法来添加事件
     * 接收3个参数：要操作的元素、事件名称和事件处理程序函数
     * */
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, handler);
        } else {
            element['on' + type] = handler;
        }
    },

    /**
     * delegate()为指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序
     * 适用于当前或未来的元素（比如由脚本创建的新元素）
     * 接收4个参数：要操作元素的父元素、被操作元素、事件名称和事件处理函数
     * */
    delegate: function(element, childElement, type, handler) {
        this.addHandler(element, type, function() {
            var e = arguments[0] || window.event,
                target = e.target || e.srcElement;

            if (target && target.tagName === childElement.toUpperCase()) {
                handler.call(target, e);
            }
        })
    },

    /**
     * getEvent()返回对event对象的引用
     * */
    getEvent: function(event) {
        return event ? event : window.event;
    },

    /**
     * getTarget()返回事件的目标
     * */
    getTarget: function(event) {
        return event.target || event.srcElement;
    },

    /**
     * preventDefault()取消事件的默认行为
     * */
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    /**
     * removeHandler()移除事件
     * 接收3个参数：要操作的元素、事件名称和事件处理程序函数
     * */
    removeHandler: function(element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + type, handler);
        } else {
            element['on' + type] = null;
        }
    },

    /**
     * stopPropagation()阻止事件流
     * */
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};