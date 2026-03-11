import "./disable.scss";
import {Dom} from "../common/common";
import { StyleConfig, CaptchaData, CaptchaConfigData } from "../../types";

const TYPE = "DISABLE";

function getTemplate(styleConfig: StyleConfig): string {
   return `
    <div id="tianai-captcha" class="tianai-captcha-disable">
        <div class="slider-tip">
            <span id="tianai-captcha-slider-move-track-font" style="font-size: ${styleConfig.i18n?.disable_title_size || '15px'}">${styleConfig.i18n?.disable_title || '验证码已禁用'}</span>
        </div>
        <div class="content">
           <div class="bg-img-div">
<!--                <svg width="100" height="100" viewBox="0 0 100 100">-->
<!--                  <polygon points="50,10 90,90 10,90" fill="none" stroke="#FF9900" stroke-width="4"/>-->
<!--                  <path d="M50 35V65 M50 75V75" stroke="#FF9900" stroke-width="4" stroke-linecap="round"/>-->
<!--                </svg>-->
                <span id="content-span"></span>
            </div>
        </div>
    </div>
    `;
}

class Disable {
    boxEl: any;
    styleConfig: StyleConfig;
    style: StyleConfig;
    type: string;
    currentCaptchaData: CaptchaConfigData;
    endCallback?: (data: any, captcha: any) => void;
    el: any;

    constructor(boxEl: any, styleConfig: StyleConfig) {
        this.boxEl = boxEl;
        this.styleConfig = styleConfig;
        this.style = styleConfig;
        this.type = TYPE;
        this.currentCaptchaData = {
            startTime: new Date(),
            tracks: [],
            movePercent: 0,
            clickCount: 0,
            bgImageWidth: 0,
            bgImageHeight: 0,
            templateImageWidth: 0,
            templateImageHeight: 0,
            end: 0
        };
    }

    showTips(msg: string, type: number, callback: () => void): void {
        // 禁用状态下不需要显示提示
        if (callback) callback();
    }

    closeTips(msg: string, callback: () => void): void {
        // 禁用状态下不需要关闭提示
        if (callback) callback();
    }

    init(captchaData: CaptchaData, endCallback: (data: any, captcha: Disable) => void, loadSuccessCallback?: (captcha: Disable) => void): Disable {
        // 重载样式
        this.destroy();
        this.boxEl.append(getTemplate(this.styleConfig));
        this.el = this.boxEl.find("#tianai-captcha");
        // 绑定全局
        // window.currentCaptcha = this;
        // 载入验证码
        this.loadCaptchaForData(this, captchaData);
        this.endCallback = endCallback;
        if (loadSuccessCallback) {
            // 加载成功
            loadSuccessCallback(this);
        }
        return this;
    }

    destroy(): void {
        const existsCaptchaEl = this.boxEl.find("#tianai-captcha");
        if (existsCaptchaEl) {
            existsCaptchaEl.remove();
        }
    }

    loadCaptchaForData(that: Disable, data: CaptchaData): void {
        const msg = data.msg || data.message || "接口异常";
        that.el.find("#content-span").text(msg);
    }
}

export default Disable;
