/**
 * @param { function } 要节流的方法
 * @param { wait } 函数执行间隔时间
 * @retrun { throttled: function }
 */
export function throttle(func, wait) {
    let timer = null;
    let previous = 0;
    const throttled = function() {
        const that = this;
        const args = arguments;
        const now = +new Date();
        // 离下一次执行的剩余时间
        const remaining = wait - (now - previous);
        // 当下一次执行的剩余时间 <= 0 或者 因为用户更改了系统时间为 1970年 之前时 执行一次
        if (remaining <= 0 || remaining > wait) {
            // 清除定时
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            func.apply(that, args);
            previous = +new Date();
        } else if (!timer) {
            timer = setTimeout(function() {
                func.apply(that, args);
                clearTimeout(timer);
                timer = null;
                previous = +new Date();
            }, remaining);
        }
    };
    return throttled;
}