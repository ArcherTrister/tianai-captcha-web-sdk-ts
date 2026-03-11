/** 是否打印日志 */
var isPrintLog = false;

function printLog(params: any): void {
    if (isPrintLog) {
        console.log(JSON.stringify(params));
    }
}

/**
 * 清除默认事件
 * @param event event
 */
function clearPreventDefault(event: Event): void {
    if (event.preventDefault) {
        event.preventDefault();
    }
}

/**
 * 阻止某div默认事件
 * @param dom
 */
function clearAllPreventDefault(dom: any): void {
    Dom(dom).each((el: Element) => {
        // 手机端
        el.addEventListener('touchmove', clearPreventDefault, {passive: false});
        // pc端
        el.addEventListener('mousemove', clearPreventDefault, {passive: false});
    });
}

function reductionAllPreventDefault(dom: any): void {
    Dom(dom).each(function (el: Element) {
        el.removeEventListener('touchmove', clearPreventDefault);
        el.addEventListener('mousemove', clearPreventDefault);
    });
}

/**
 * 获取当前坐标
 * @param event 事件
 * @returns {{x: number, y: number}}
 */
function getCurrentCoordinate(event: any): { x: number; y: number } {
    if (event.pageX !== null && event.pageX !== undefined) {
        return {
            x: Math.round(event.pageX),
            y: Math.round(event.pageY)
        };
    }
    let targetTouches: any;
    if (event.changedTouches) {
        // 抬起事件
        targetTouches = event.changedTouches;
    } else if (event.targetTouches) {
        // pc 按下事件
        targetTouches = event.targetTouches;
    } else if (event.originalEvent && event.originalEvent.targetTouches) {
        // 鼠标触摸事件
        targetTouches = event.originalEvent.targetTouches;
    }
    if (targetTouches[0].pageX !== null && targetTouches[0].pageX !== undefined) {
        return {
            x: Math.round(targetTouches[0].pageX),
            y: Math.round(targetTouches[0].pageY)
        };
    }
    return {
        x: Math.round(targetTouches[0].clientX),
        y: Math.round(targetTouches[0].clientY)
    };
}

interface CurrentCaptcha {
    currentCaptchaData: {
        startX?: number;
        startY?: number;
        stopTime?: Date;
        tracks: Array<{
            x: number;
            y: number;
            type: string;
            t: number;
        }>;
        startTime: Date;
        end?: number;
        bgImageWidth: number;
        moveX?: number;
        moveY?: number;
    };
    __m__?: (event: any) => void;
    __u__?: (event: any) => void;
    doDown?: (event: any, captcha: CurrentCaptcha) => void;
    doMove?: (event: any, captcha: CurrentCaptcha) => void;
    doUp?: (event: any, captcha: CurrentCaptcha) => void;
    endCallback?: (data: any, captcha: any) => void;
}

function down(currentCaptcha: CurrentCaptcha, event: any): void {
    // debugger
    const coordinate = getCurrentCoordinate(event);
    let startX = coordinate.x;
    let startY = coordinate.y;
    currentCaptcha.currentCaptchaData.startX = startX;
    currentCaptcha.currentCaptchaData.startY = startY;
    const tracks = currentCaptcha.currentCaptchaData.tracks;
    currentCaptcha.currentCaptchaData.startTime = new Date();
    const startTime = currentCaptcha.currentCaptchaData.startTime;

    tracks.push({
        x: coordinate.x,
        y: coordinate.y,
        type: "down",
        t: (new Date().getTime() - startTime.getTime())
    });
    printLog(["start", startX, startY]);
    currentCaptcha.__m__ = move.bind(null, currentCaptcha);
    currentCaptcha.__u__ = up.bind(null, currentCaptcha);
    // pc
    window.addEventListener("mousemove", currentCaptcha.__m__);
    window.addEventListener("mouseup", currentCaptcha.__u__);
    // 手机端
    window.addEventListener("touchmove", currentCaptcha.__m__, false);
    window.addEventListener("touchend", currentCaptcha.__u__, false);
    if (currentCaptcha && currentCaptcha.doDown) {
        currentCaptcha.doDown(event, currentCaptcha);
    }
}

function move(currentCaptcha: CurrentCaptcha, event: any): void {
    if (event.touches && event.touches.length > 0) {
        event = event.touches[0];
    }
    // debugger
    const coordinate = getCurrentCoordinate(event);
    let pageX = coordinate.x;
    let pageY = coordinate.y;
    const startX = currentCaptcha.currentCaptchaData.startX;
    const startY = currentCaptcha.currentCaptchaData.startY;
    const startTime = currentCaptcha.currentCaptchaData.startTime;
    const end = currentCaptcha.currentCaptchaData.end;
    const bgImageWidth = currentCaptcha.currentCaptchaData.bgImageWidth;
    const tracks = currentCaptcha.currentCaptchaData.tracks;
    let moveX = pageX - (startX || 0);
    let moveY = pageY - (startY || 0);
    const track = {
        x: coordinate.x,
        y: coordinate.y,
        type: "move",
        t: (new Date().getTime() - startTime.getTime())
    };
    tracks.push(track);
    if (moveX < 0) {
        moveX = 0;
    } else if (end !== undefined && moveX > end) {
        moveX = end;
    }
    currentCaptcha.currentCaptchaData.moveX = moveX;
    currentCaptcha.currentCaptchaData.moveY = moveY;
    if (currentCaptcha.doMove) {
        currentCaptcha.doMove(event, currentCaptcha);
    }
    printLog(["move", track]);
}

function destroyEvent(currentCaptcha: CurrentCaptcha): void {
    if (currentCaptcha) {
        if (currentCaptcha.__m__) {
            window.removeEventListener("mousemove", currentCaptcha.__m__);
            window.removeEventListener("touchmove", currentCaptcha.__m__);
        }
        if (currentCaptcha.__u__) {
            window.removeEventListener("mouseup", currentCaptcha.__u__);
            window.removeEventListener("touchend", currentCaptcha.__u__);
        }
    }
}

function up(currentCaptcha: CurrentCaptcha, event: any): void {
    destroyEvent(currentCaptcha);
    const coordinate = getCurrentCoordinate(event);
    currentCaptcha.currentCaptchaData.stopTime = new Date();
    const startTime = currentCaptcha.currentCaptchaData.startTime;
    const tracks = currentCaptcha.currentCaptchaData.tracks;

    const track = {
        x: coordinate.x,
        y: coordinate.y,
        type: "up",
        t: (new Date().getTime() - startTime.getTime())
    };

    tracks.push(track);
    printLog(["up", track]);
    printLog(["tracks", tracks]);
    if (currentCaptcha.doUp) {
        currentCaptcha.doUp(event, currentCaptcha);
    }
    if (currentCaptcha.endCallback) {
        currentCaptcha.endCallback(currentCaptcha.currentCaptchaData, currentCaptcha);
    }
}

function initConfig(bgImageWidth: number, bgImageHeight: number, templateImageWidth: number, templateImageHeight: number, end: number): any {
    // bugfix 图片宽高可能会有小数情况，强转一下整数
    const currentCaptchaConfig = {
        startTime: new Date(),
        tracks: [],
        movePercent: 0,
        clickCount: 0,
        bgImageWidth: Math.round(bgImageWidth),
        bgImageHeight: Math.round(bgImageHeight),
        templateImageWidth: Math.round(templateImageWidth),
        templateImageHeight: Math.round(templateImageHeight),
        end: end
    };
    printLog(["init", currentCaptchaConfig]);
    return currentCaptchaConfig;
}

function closeTips(el: any, msg?: string, callback?: () => void): void {
    const tipEl = Dom(el).find("#tianai-captcha-tips");
    if (tipEl) {
        tipEl.removeClass("tianai-captcha-tips-on");
    }
    // tipEl.removeClass("tianai-captcha-tips-success")
    // tipEl.removeClass("tianai-captcha-tips-error")
    // 延时
    if (callback) {
        setTimeout(callback, 0.35);
    }
}

function showTips(el: any, msg: string, type: number, callback: () => void): void {
    const tipEl = Dom(el).find("#tianai-captcha-tips");
    if (tipEl) {
        tipEl.text(msg);
        if (type === 1) {
            // 成功
            tipEl.removeClass("tianai-captcha-tips-error");
            tipEl.addClass("tianai-captcha-tips-success");
        } else {
            // 失败
            tipEl.removeClass("tianai-captcha-tips-success");
            tipEl.addClass("tianai-captcha-tips-error");
        }
        tipEl.addClass("tianai-captcha-tips-on");
    }
    // 延时
    setTimeout(callback, 1000);
}

class CommonCaptcha {
    el: any;

    showTips(msg: string, type: number, callback: () => void): void {
        showTips(this.el, msg, type, callback);
    }

    closeTips(msg: string, callback: () => void): void {
        closeTips(this.el, msg, callback);
    }
}

function Dom(domStr: any, dom?: any): DomEl {
    return new DomEl(domStr, dom);
}

class DomEl {
    dom: Element | null;
    domStr: string;

    constructor(domStr: any, dom?: any) {
        if (dom && typeof dom === 'object' && typeof dom.nodeType !== 'undefined') {
            this.dom = dom;
            this.domStr = domStr;
            return;
        }
        if (domStr instanceof DomEl) {
            this.dom = domStr.dom;
            this.domStr = domStr.domStr;
        } else if (typeof domStr === "string") {
            this.dom = document.querySelector(domStr);
            this.domStr = domStr;
        } else if (typeof document === 'object' && typeof document.nodeType !== 'undefined') {
            this.dom = domStr;
            this.domStr = domStr.nodeName;
        } else {
            throw new Error("不支持的类型");
        }
    }

    each(callback: (el: Element) => void): void {
        this.getTarget().querySelectorAll("*").forEach(callback);
    }

    removeClass(className: string): DomEl {
        let element = this.getTarget();
        if (element.classList) {
            // 使用 classList API 移除类
            element.classList.remove(className);
        } else {
            // 兼容旧版本浏览器
            const currentClass = element.className;
            const regex = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');
            element.className = currentClass.replace(regex, '');
        }
        return this;
    }

    addClass(className: string): DomEl {
        const element = this.getTarget();
        if (element.classList) {
            // 使用 classList API 添加类
            element.classList.add(className);
        } else {
            // 兼容旧版本浏览器
            let currentClass = element.className;
            if (currentClass.indexOf(className) === -1) {
                element.className = currentClass + ' ' + className;
            }
        }
        return this;
    }

    find(str: string): DomEl | null {
        const el = this.getTarget().querySelector(str);
        if (el) {
            return new DomEl(str, el);
        }
        return null;
    }

    children(selector: string): DomEl | null {
        const childNodes = this.getTarget().childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeType === 1 && (childNodes[i] as Element).matches(selector)) {
                return new DomEl(selector, childNodes[i]);
            }
        }
        return null;
    }

    remove(): null {
        this.getTarget().remove();
        return null;
    }

    css(property: string | Record<string, string>, value?: string): string | void {
        const target = this.getTarget() as HTMLElement;
        if (typeof property === 'string' && typeof value === 'string') {
            // 设置单个属性
            target.style[property as any] = value;
        } else if (typeof property === 'object') {
            // 设置多个属性
            for (var prop in property) {
                if (property.hasOwnProperty(prop)) {
                    target.style[prop as any] = property[prop];
                }
            }
        } else if (typeof property === 'string' && typeof value === 'undefined') {
            // 获取单个属性
            return window.getComputedStyle(target)[property as any];
        }
    }

    attr(attributeName: string, value?: string): DomEl | string {
        if (value === undefined) {
            // 如果未提供值，则返回属性的当前值
            return this.getTarget().getAttribute(attributeName) || '';
        } else {
            // 如果提供了值，则设置属性的值
            this.getTarget().setAttribute(attributeName, value);
        }
        return this;
    }

    text(str: string): DomEl {
        (this.getTarget() as HTMLElement).innerText = str;
        return this;
    }

    html(str: string): DomEl {
        (this.getTarget() as HTMLElement).innerHTML = str;
        return this;
    }

    is(dom: any): boolean {
        if (dom && typeof dom === 'object' && typeof dom.nodeType !== 'undefined') {
            return this.dom === dom;
        }
        if (dom instanceof DomEl) {
            return this.dom === dom.dom;
        }
        return false;
    }

    append(content: string | HTMLElement): DomEl {
        if (typeof content === 'string') {
            this.getTarget().insertAdjacentHTML("beforeend", content);
        } else if (content instanceof HTMLElement) {
            this.getTarget().appendChild(content);
        } else {
            throw new Error('Invalid content type');
        }
        return this;
    }

    click(fun: (event: Event) => void): DomEl {
        this.on("click", fun);
        return this;
    }

    mousedown(fun: (event: Event) => void): DomEl {
        this.on("mousedown", fun);
        return this;
    }

    touchstart(fun: (event: Event) => void): DomEl {
        this.on("touchstart", fun);
        return this;
    }

    on(eventType: string, fun: (event: Event) => void): DomEl {
        this.getTarget().addEventListener(eventType, fun, {passive: true});
        return this;
    }

    width(): number {
        return (this.getTarget() as HTMLElement).offsetWidth;
    }

    height(): number {
        return (this.getTarget() as HTMLElement).offsetHeight;
    }

    getTarget(): Element {
        if (this.dom) {
            return this.dom;
        }
        throw new Error("dom不存在: [" + this.domStr + "]");
    }
}

interface HttpOptions {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    data?: any;
}

function http(options: HttpOptions): Promise<any> {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', options.url);
        // 设置请求头
        if (options.headers) {
            for (const header in options.headers) {
                if (options.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, options.headers[header]);
                }
            }
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status <= 500) {
                    const contentType = xhr.getResponseHeader('Content-Type');
                    if (contentType && contentType.indexOf('application/json') !== -1) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error('Request failed with status: ' + xhr.status));
                }
            }
        };
        xhr.onerror = function () {
            reject(new Error('Network Error'));
        };
        xhr.send(options.data);
    });
}

function isEmptyObject(obj: any): boolean {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false; // 对象不为空
        }
    }
    return true; // 对象为空
}


export {
    isEmptyObject,
    http,
    Dom,
    DomEl,
    CommonCaptcha,
    clearAllPreventDefault,
    down,
    move,
    up,
    initConfig,
    showTips,
    closeTips,
    destroyEvent
}
