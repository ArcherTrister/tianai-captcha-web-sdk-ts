import StyleConfig from "./styleConfig";
import {Dom, http} from "../common/common";
import { CaptchaConfigOptions, RequestParam, RequestChain, TianAiCaptcha } from "../../types";

class CaptchaConfig {
    bindEl: string;
    domBindEl: any;
    requestCaptchaDataUrl: string;
    validCaptchaUrl: string;
    validSuccess: (res: any, c: any, tac: TianAiCaptcha) => void;
    validFail: (res: any, c: any, tac: TianAiCaptcha) => void;
    requestHeaders: Record<string, string>;
    btnCloseFun?: (el: any, tac: TianAiCaptcha) => void;
    btnRefreshFun?: (el: any, tac: TianAiCaptcha) => void;
    requestChain: RequestChain[];
    timeToTimestamp: boolean;

    constructor(args: CaptchaConfigOptions) {
        if (!args.bindEl) {
            throw new Error("[TAC] 必须配置 [bindEl]用于将验证码绑定到该元素上");
        }
        if (!args.requestCaptchaDataUrl) {
            throw new Error("[TAC] 必须配置 [requestCaptchaDataUrl]请求验证码接口");
        }
        if (!args.validCaptchaUrl) {
            throw new Error("[TAC] 必须配置 [validCaptchaUrl]验证验证码接口");
        }
        this.bindEl = args.bindEl;
        this.domBindEl = Dom(args.bindEl);
        this.requestCaptchaDataUrl = args.requestCaptchaDataUrl;
        this.validCaptchaUrl = args.validCaptchaUrl;
        if (args.validSuccess) {
            this.validSuccess = args.validSuccess;
        } else {
            this.validSuccess = this.defaultValidSuccess;
        }
        if (args.validFail) {
            this.validFail = args.validFail;
        } else {
            this.validFail = this.defaultValidFail;
        }
        if (args.requestHeaders) {
            this.requestHeaders = args.requestHeaders
        } else {
            this.requestHeaders = {}
        }
        if (args.btnCloseFun) {
            this.btnCloseFun = args.btnCloseFun;
        }
        if (args.btnRefreshFun) {
            this.btnRefreshFun = args.btnRefreshFun;
        }
        this.requestChain = [];
        // 时间戳转换
        this.timeToTimestamp = args.timeToTimestamp || true;
        this.insertRequestChain(0, {
            preRequest: (type: string, param: RequestParam, c: any, tac: TianAiCaptcha) => {
                if (this.timeToTimestamp && param.data) {
                    for (let key in param.data) {
                        // 将date全部转换为时间戳
                        if (param.data[key] instanceof Date) {
                            param.data[key] = param.data[key].getTime();
                        }
                    }
                }
                return true;
            }
        })
    }

    addRequestChain(fun: RequestChain) {
        this.requestChain.push(fun);
    }

    insertRequestChain(index: number, chain: RequestChain) {
        this.requestChain.splice(index, 0, chain);
    }

    removeRequestChain(index: number) {
        this.requestChain.splice(index, 1);
    }

    requestCaptchaData() {
        const requestParam: RequestParam = {
            url: this.requestCaptchaDataUrl,
            method: "POST",
            headers: this.requestHeaders || {},
            data: {}
        };
        // 设置默认值
        requestParam.headers["Content-Type"] = "application/json;charset=UTF-8";
        // 请求前装载参数
        this._preRequest("requestCaptchaData", requestParam);
        // 发送请求
        const request = this.doSendRequest(requestParam);
        // 返回结果
        return request.then(res => {
            // 装返回结果
            this._postRequest("requestCaptchaData", requestParam, res);
            // 返回结果
            return res;
        });
    }

    doSendRequest(requestParam: RequestParam) {
        // 如果content-type是json，那么data就是json字符串, 这里直接匹配所有header是否包含application/json
        if (requestParam.headers) {
            for (const key in requestParam.headers) {
                if (requestParam.headers[key].indexOf("application/json") > -1) {
                    if (typeof requestParam.data !== "string") {
                        requestParam.data = JSON.stringify(requestParam.data);
                    }
                    break;
                }
            }
        }
        return http(requestParam).then(res => {
            try {
                return JSON.parse(res);
            } catch (e) {
                return res;
            }
        })
    }

    _preRequest(type: string, requestParam: RequestParam, c?: any, tac?: any) {
        for (let i = 0; i < this.requestChain.length; i++) {
            const r = this.requestChain[i];
            if (r.preRequest) {
                if (!r.preRequest(type, requestParam, this, c, tac)) {
                    break;
                }
            }
        }

    }

    _postRequest(type: string, requestParam: RequestParam, res: any, c?: any, tac?: any) {
        for (let i = 0; i < this.requestChain.length; i++) {
            const r = this.requestChain[i];
            // 判断r是否存圩postRequest方法
            if (r.postRequest) {
                if (!r.postRequest(type, requestParam, res, this, c, tac)) {
                    break;
                }
            }
        }
    }

    validCaptcha(currentCaptchaId: string, data: any, c: any, tac: any) {
        const sendParam = {
            id: currentCaptchaId,
            data: data
        };
        let requestParam: RequestParam = {
            url: this.validCaptchaUrl,
            method: "POST",
            headers: this.requestHeaders || {},
            data: sendParam
        };
        requestParam.headers["Content-Type"] = "application/json;charset=UTF-8";

        this._preRequest("validCaptcha", requestParam, c, tac);
        const request = this.doSendRequest(requestParam);
        return request.then(res => {
            this._postRequest("validCaptcha", requestParam, res, c, tac);
            return res;
        }).then(res => {
            if (res.code == 200) {
                const useTimes = (data.stopTime - data.startTime) / 1000;
                c.showTips(`验证成功,耗时${useTimes}秒`, 1, () => this.validSuccess(res, c, tac));
            } else {
                let tipMsg = "验证失败，请重新尝试!";
                if (res.code) {
                    if (res.code != 4001) {
                        tipMsg = "验证码被黑洞吸走了！";
                    }
                }
                c.showTips(tipMsg, 0, () => this.validFail(res, c, tac));
            }
        }).catch(e => {
            let tipMsg = c.styleConfig?.i18n?.tips_error || "验证失败，请重新尝试!";
            if (e.code && e.code != 200) {
                if (e.code != 4001) {
                    tipMsg = c.styleConfig?.i18n?.tips_4001 || "验证码被黑洞吸走了！";
                }
                c.showTips(tipMsg, 0, () => this.validFail(e, c, tac));
            }
        })

    }

    defaultValidSuccess(res: any, c: any, tac: any) {
        console.log("验证码校验成功， 请重写  [config.validSuccess] 方法， 用于自定义逻辑处理");
        (window as any).currentCaptchaRes = res;
        tac.destroyWindow();
    }

    defaultValidFail(res: any, c: any, tac: any) {
        tac.reloadCaptcha();
    }
}

function wrapConfig(config: CaptchaConfigOptions | CaptchaConfig): CaptchaConfig {
    if (config instanceof CaptchaConfig) {
        return config;
    }
    return new CaptchaConfig(config);
}

function wrapStyle(style: any) {
    let margeStyle = {...StyleConfig, ...style};
    margeStyle.i18n = {...StyleConfig.i18n, ...style?.i18n};
    return margeStyle;
}

const captchaRequestChains: Record<string, any> = {}


export {CaptchaConfig, wrapConfig, wrapStyle}
